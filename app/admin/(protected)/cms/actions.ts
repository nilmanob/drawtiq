"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PUBLIC_CONTENT_TAG } from "@/lib/content/cache";
import { describeDbError } from "@/lib/admin/errors";
import { formString } from "@/lib/admin/form-data";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { uuidSchema } from "@/lib/validation/content";
import { isCmsTable } from "./config";
import { CMS_SCHEMAS, SINGLETON_TABLES } from "./schema";

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/cms", "layout");
  revalidateTag(PUBLIC_CONTENT_TAG);
}

function isSingleton(table: string) {
  return (SINGLETON_TABLES as readonly string[]).includes(table);
}

function buildRecord(table: string, formData: FormData) {
  const fields = CMS_SCHEMAS[table];
  const record: Record<string, unknown> = {};
  const fieldErrors: Record<string, string[]> = {};

  if (!fields) {
    return { record, fieldErrors: { table: ["Unsupported content collection."] } };
  }

  for (const field of fields) {
    if (field.json) {
      const raw = formString(formData, field.name).trim();
      const isArray = field.name === "options" || field.name === "social_links";
      const expected = isArray ? "array" : "object";

      if (!raw) {
        if (field.required) {
          fieldErrors[field.name] = [`${field.label} must be a JSON ${expected}.`];
          continue;
        }
        record[field.name] = isArray ? [] : {};
        continue;
      }

      try {
        const parsed: unknown = JSON.parse(raw);
        if (
          isArray
            ? !Array.isArray(parsed)
            : parsed === null || typeof parsed !== "object" || Array.isArray(parsed)
        ) {
          throw new Error("wrong shape");
        }
        record[field.name] = parsed;
      } catch {
        fieldErrors[field.name] = [`${field.label} must be valid JSON (${expected}).`];
      }
      continue;
    }

    if (field.type === "checkbox") {
      record[field.name] = formData.get(field.name) === "on";
      continue;
    }

    if (field.num) {
      const raw = formString(formData, field.name).trim();
      const value = raw ? Number(raw) : 0;

      if (!Number.isInteger(value) || value < 0) {
        fieldErrors[field.name] = [`${field.label} must be a whole number of 0 or more.`];
        continue;
      }

      record[field.name] = value;
      continue;
    }

    const raw = formString(formData, field.name);

    if (field.required && !raw.trim()) {
      fieldErrors[field.name] = [`${field.label} is required.`];
      continue;
    }

    record[field.name] = raw.trim() ? raw : null;
  }

  return { record, fieldErrors };
}

export async function saveCmsRecord(formData: FormData): Promise<AdminActionResult> {
  const table = formString(formData, "table");
  const id = formString(formData, "id").trim();

  if (!isCmsTable(table)) return { ok: false, error: "Unsupported content collection." };
  if (id && !uuidSchema.safeParse(id).success) return { ok: false, error: "Invalid record id." };

  const { record, fieldErrors } = buildRecord(table, formData);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: "Please fix the highlighted fields and save again.",
      fieldErrors,
    };
  }

  const { supabase } = await requirePermission("content:write");

  if (!id && isSingleton(table)) {
    const { data: existing, error: existingError } = await supabase
      .from(table)
      .select("id")
      .limit(1);

    if (existingError) return { ok: false, error: describeDbError(existingError) };
    if (existing && existing.length > 0) {
      return {
        ok: false,
        error: "This is a single settings record. Edit the existing one instead of creating another.",
      };
    }
  }

  const query = id
    ? supabase.from(table).update(record).eq("id", id).select("id").maybeSingle()
    : supabase.from(table).insert(record).select("id").single();

  const { data, error } = await query;

  if (error) return { ok: false, error: describeDbError(error) };
  if (!data) {
    return {
      ok: false,
      error: "Record not found or you no longer have permission to edit it.",
    };
  }

  refresh();
  return { ok: true, id: data.id };
}

export async function moveCmsRecord(
  table: string,
  id: string,
  direction: "up" | "down"
): Promise<AdminActionResult> {
  if (!isCmsTable(table) || !uuidSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid content record." };
  }

  const fields = CMS_SCHEMAS[table] ?? [];
  if (!fields.some((field) => field.name === "order_index")) {
    return { ok: false, error: "This collection does not support ordering." };
  }

  const { supabase } = await requirePermission("content:write");
  const { data, error } = await supabase
    .from(table)
    .select("id, order_index")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return { ok: false, error: describeDbError(error) };

  const rows = data ?? [];
  const index = rows.findIndex((row: any) => row.id === id);
  if (index === -1) return { ok: false, error: "Record not found." };

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= rows.length) return { ok: true, id };

  const current = rows[index] as any;
  const target = rows[targetIndex] as any;
  let currentOrder = current.order_index as number;
  let targetOrder = target.order_index as number;

  if (currentOrder === targetOrder) {
    currentOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
  }

  const { error: firstError } = await supabase
    .from(table)
    .update({ order_index: targetOrder })
    .eq("id", current.id);
  if (firstError) return { ok: false, error: describeDbError(firstError) };

  const { error: secondError } = await supabase
    .from(table)
    .update({ order_index: currentOrder })
    .eq("id", target.id);
  if (secondError) return { ok: false, error: describeDbError(secondError) };

  refresh();
  return { ok: true, id };
}

export async function toggleCmsVisibility(
  table: string,
  id: string
): Promise<AdminActionResult> {
  if (!isCmsTable(table) || !uuidSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid content record." };
  }

  const fields = CMS_SCHEMAS[table] ?? [];
  if (!fields.some((field) => field.name === "is_visible")) {
    return { ok: false, error: "This collection does not use visibility." };
  }

  const { supabase } = await requirePermission("content:write");
  const { data: current, error: readError } = await supabase
    .from(table)
    .select("id, is_visible")
    .eq("id", id)
    .maybeSingle();

  if (readError) return { ok: false, error: describeDbError(readError) };
  if (!current) return { ok: false, error: "Record not found." };

  const { error } = await supabase
    .from(table)
    .update({ is_visible: !(current as any).is_visible })
    .eq("id", id);
  if (error) return { ok: false, error: describeDbError(error) };

  refresh();
  return { ok: true, id };
}

export async function deleteCmsRecord(table: string, id: string): Promise<AdminActionResult> {
  if (!isCmsTable(table) || !uuidSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid content record." };
  }

  if (isSingleton(table)) {
    return {
      ok: false,
      error: "Site settings cannot be deleted. Edit the existing record instead.",
    };
  }

  const { supabase } = await requirePermission("content:write");
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: describeDbError(error) };
  if (!data) {
    return {
      ok: false,
      error: "Record not found or you no longer have permission to delete it.",
    };
  }

  refresh();
  return { ok: true, id };
}

export async function moveCmsRecordUp(table: string, id: string): Promise<void> {
  await moveCmsRecord(table, id, "up");
}

export async function moveCmsRecordDown(table: string, id: string): Promise<void> {
  await moveCmsRecord(table, id, "down");
}

export async function toggleCmsVisibilityAction(
  table: string,
  id: string
): Promise<void> {
  await toggleCmsVisibility(table, id);
}
