"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { describeDbError } from "@/lib/admin/errors";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { formString, zodFieldErrors } from "@/lib/admin/form-data";
import { inquiryStatusSchema, uuidSchema } from "@/lib/validation/content";
import { z } from "zod";

const statusInputSchema = z.object({
  id: uuidSchema,
  status: inquiryStatusSchema,
});

export async function updateInquiryStatus(
  formData: FormData
): Promise<AdminActionResult> {
  const { supabase } = await requirePermission("inquiries:write");
  const parsed = statusInputSchema.safeParse({
    id: formString(formData, "id"),
    status: formString(formData, "status"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Choose a valid inquiry status.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const { data, error } = await supabase
    .from("inquiries")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: describeDbError(error) };
  }

  if (!data) {
    return {
      ok: false,
      error: "Inquiry not found or you no longer have permission to edit it.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${parsed.data.id}`);

  return { ok: true, id: parsed.data.id };
}
