"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { PUBLIC_CONTENT_TAG } from "@/lib/content/cache";
import { describeDbError } from "@/lib/admin/errors";
import type { AdminActionResult } from "@/lib/admin/action-result";
import {
  commaList,
  formJsonArray,
  formString,
  mergeFieldErrors,
  zodFieldErrors,
} from "@/lib/admin/form-data";
import { serviceInputSchema, uuidSchema } from "@/lib/validation/content";

function revalidateService(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/service-ui-ux");
  revalidatePath("/service-graphic-design");
  revalidatePath("/service-motion-design");
  revalidatePath("/service-video-editing");
  revalidateTag(PUBLIC_CONTENT_TAG);
  if (id) {
    revalidatePath(`/admin/services/${id}`);
  }
}

export async function saveService(
  formData: FormData
): Promise<AdminActionResult> {
  const { supabase } = await requireAdmin();
  const id = formString(formData, "id").trim();
  const deliverables = formJsonArray(formData, "deliverables");
  const faqs = formJsonArray(formData, "faqs");
  const jsonErrors: Record<string, string[]> = {};

  if (deliverables.error) {
    jsonErrors.deliverables = [deliverables.error];
  }
  if (faqs.error) {
    jsonErrors.faqs = [faqs.error];
  }

  if (id && !uuidSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid service id." };
  }

  const parsed = serviceInputSchema.safeParse({
    slug: formString(formData, "slug"),
    title: formString(formData, "title"),
    blurb: formString(formData, "blurb"),
    intro: formString(formData, "intro"),
    icon: formString(formData, "icon"),
    preview_path: formString(formData, "preview_path"),
    tags: commaList(formString(formData, "tags")),
    deliverables: deliverables.value,
    faqs: faqs.value,
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
      .from("services")
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
        error: "Service not found or you no longer have permission to edit it.",
      };
    }

    revalidateService(id);
    return { ok: true, id };
  }

  const { data, error } = await supabase
    .from("services")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: describeDbError(error) };
  }

  revalidateService(data.id);
  return { ok: true, id: data.id };
}

export async function deleteService(id: string): Promise<AdminActionResult> {
  const { supabase } = await requireAdmin();

  if (!uuidSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid service id." };
  }

  const { data, error } = await supabase
    .from("services")
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
      error: "Service not found or you no longer have permission to delete it.",
    };
  }

  revalidateService(id);
  return { ok: true, id };
}
