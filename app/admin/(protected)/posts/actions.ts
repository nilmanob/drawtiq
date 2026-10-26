"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { PUBLIC_CONTENT_TAG } from "@/lib/content/cache";
import { describeDbError } from "@/lib/admin/errors";
import type { AdminActionResult } from "@/lib/admin/action-result";
import {
  formJsonArray,
  formJsonObject,
  formString,
  mergeFieldErrors,
  zodFieldErrors,
} from "@/lib/admin/form-data";
import { postInputSchema, uuidSchema } from "@/lib/validation/content";

function revalidatePost(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath("/insights");
  revalidatePath("/insights/[slug]", "page");
  revalidateTag(PUBLIC_CONTENT_TAG);
  if (id) {
    revalidatePath(`/admin/posts/${id}`);
  }
}

export async function savePost(
  formData: FormData
): Promise<AdminActionResult> {
  const { supabase } = await requireAdmin();
  const id = formString(formData, "id").trim();
  const display = formJsonObject(formData, "display");
  const body = formJsonArray(formData, "body");
  const jsonErrors: Record<string, string[]> = {};

  if (display.error) {
    jsonErrors.display = [display.error];
  }
  if (body.error) {
    jsonErrors.body = [body.error];
  }

  if (id && !uuidSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid blog post id." };
  }

  const parsed = postInputSchema.safeParse({
    slug: formString(formData, "slug"),
    title: formString(formData, "title"),
    excerpt: formString(formData, "excerpt"),
    category: formString(formData, "category"),
    read_time: formString(formData, "read_time"),
    visual: formString(formData, "visual"),
    label: formString(formData, "label"),
    display: display.value,
    body: body.value,
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
      .from("blog_posts")
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
        error: "Blog post not found or you no longer have permission to edit it.",
      };
    }

    revalidatePost(id);
    return { ok: true, id };
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: describeDbError(error) };
  }

  revalidatePost(data.id);
  return { ok: true, id: data.id };
}

export async function deletePost(id: string): Promise<AdminActionResult> {
  const { supabase } = await requireAdmin();

  if (!uuidSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid blog post id." };
  }

  const { data, error } = await supabase
    .from("blog_posts")
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
      error: "Blog post not found or you no longer have permission to delete it.",
    };
  }

  revalidatePost(id);
  return { ok: true, id };
}
