"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { PUBLIC_CONTENT_TAG } from "@/lib/content/cache";
import { describeDbError } from "@/lib/admin/errors";
import type { AdminActionResult } from "@/lib/admin/action-result";
import {
  formJsonArray,
  formString,
  mergeFieldErrors,
  zodFieldErrors,
} from "@/lib/admin/form-data";
import { projectInputSchema, uuidSchema } from "@/lib/validation/content";

function revalidateProject(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath("/work");
  revalidatePath("/case-study/[project]", "page");
  revalidateTag(PUBLIC_CONTENT_TAG);
  if (id) {
    revalidatePath(`/admin/projects/${id}`);
  }
}

export async function saveProject(
  formData: FormData
): Promise<AdminActionResult> {
  const { supabase } = await requireAdmin();
  const id = formString(formData, "id").trim();
  const gallery = formJsonArray(formData, "gallery");
  const jsonErrors: Record<string, string[]> = {};

  if (gallery.error) {
    jsonErrors.gallery = [gallery.error];
  }

  if (id && !uuidSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid project id." };
  }

  const parsed = projectInputSchema.safeParse({
    slug: formString(formData, "slug"),
    title: formString(formData, "title"),
    subtitle: formString(formData, "subtitle"),
    category: formString(formData, "category"),
    discipline: formString(formData, "discipline"),
    industry: formString(formData, "industry"),
    scope: formString(formData, "scope"),
    summary: formString(formData, "summary"),
    challenge: formString(formData, "challenge"),
    approach: formString(formData, "approach"),
    solution: formString(formData, "solution"),
    outcome: formString(formData, "outcome"),
    visual_key: formString(formData, "visual_key") || "custom",
    cover_image_path: formString(formData, "cover_image_path"),
    gallery: gallery.value,
    featured: formData.get("featured"),
    status: formString(formData, "status") || "draft",
    sort_order: formString(formData, "sort_order") || "0",
    seo_title: formString(formData, "seo_title"),
    seo_description: formString(formData, "seo_description"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: mergeFieldErrors(jsonErrors, zodFieldErrors(parsed.error)),
    };
  }

  if (Object.keys(jsonErrors).length > 0) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: jsonErrors,
    };
  }

  if (id) {
    const { data, error } = await supabase
      .from("projects")
      .update(parsed.data)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      return { ok: false, error: describeDbError(error) };
    }

    if (!data) {
      return {
        ok: false,
        error: "Project not found or you no longer have permission to edit it.",
      };
    }

    revalidateProject(id);
    return { ok: true, id };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: describeDbError(error) };
  }

  revalidateProject(data.id);
  return { ok: true, id: data.id };
}

export async function deleteProject(id: string): Promise<AdminActionResult> {
  const { supabase } = await requireAdmin();

  if (!uuidSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid project id." };
  }

  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: describeDbError(error) };
  }

  if (!data) {
    return {
      ok: false,
      error: "Project not found or you no longer have permission to delete it.",
    };
  }

  revalidateProject(id);
  return { ok: true, id };
}
