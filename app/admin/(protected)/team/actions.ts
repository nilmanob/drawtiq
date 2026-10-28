"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { describeDbError } from "@/lib/admin/errors";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { formString, zodFieldErrors } from "@/lib/admin/form-data";
import { uuidSchema } from "@/lib/validation/content";

const roleSchema = z.enum(ADMIN_ROLES);
const emailSchema = z
  .string()
  .trim()
  .min(3)
  .max(254)
  .email("Enter a valid email address.");

const addMemberSchema = z.object({
  email: emailSchema,
  role: roleSchema,
});

const updateRoleSchema = z.object({
  user_id: uuidSchema,
  role: roleSchema,
});

const removeMemberSchema = z.object({
  user_id: uuidSchema,
});

export async function addTeamMember(
  formData: FormData
): Promise<AdminActionResult> {
  const { supabase } = await requirePermission("users:manage");
  const parsed = addMemberSchema.safeParse({
    email: formString(formData, "email"),
    role: formString(formData, "role") || "viewer",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the email and role.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const { data, error } = await supabase.rpc("add_admin_user", {
    p_email: parsed.data.email,
    p_role: parsed.data.role,
  });

  if (error) {
    return { ok: false, error: describeDbError(error) };
  }

  revalidatePath("/admin/team");
  revalidatePath("/admin");
  return { ok: true, id: String(data) };
}

export async function updateTeamMemberRole(
  formData: FormData
): Promise<AdminActionResult> {
  const { supabase } = await requirePermission("users:manage");
  const parsed = updateRoleSchema.safeParse({
    user_id: formString(formData, "user_id"),
    role: formString(formData, "role"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Choose a valid team role.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const { error } = await supabase.rpc("set_admin_role", {
    p_user_id: parsed.data.user_id,
    p_role: parsed.data.role,
  });

  if (error) {
    return { ok: false, error: describeDbError(error) };
  }

  revalidatePath("/admin/team");
  revalidatePath("/admin");
  return { ok: true, id: parsed.data.user_id };
}

export async function removeTeamMember(
  formData: FormData
): Promise<AdminActionResult> {
  const { supabase } = await requirePermission("users:manage");
  const parsed = removeMemberSchema.safeParse({
    user_id: formString(formData, "user_id"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid team member.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const { error } = await supabase.rpc("remove_admin_user", {
    p_user_id: parsed.data.user_id,
  });

  if (error) {
    return { ok: false, error: describeDbError(error) };
  }

  revalidatePath("/admin/team");
  revalidatePath("/admin");
  return { ok: true, id: parsed.data.user_id };
}
