"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { checkPermission } from "@/lib/auth";
import { ADMIN_ROLES, ADMIN_STATUSES, hasPermission } from "@/lib/auth/roles";
import { describeDbError } from "@/lib/admin/errors";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { formString, zodFieldErrors } from "@/lib/admin/form-data";
import { getSupabasePublicEnv } from "@/lib/env";
import { getSiteUrl } from "@/lib/site-url";
import {
  createSupabaseAuthAdmin,
  hasSupabaseAdminAuth,
} from "@/lib/supabase/admin";
import { uuidSchema } from "@/lib/validation/content";

// The shared action result plus a human-readable success message.
export type TeamActionResult =
  | (Extract<AdminActionResult, { ok: true }> & { message: string })
  | Extract<AdminActionResult, { ok: false }>;

const roleSchema = z.enum(ADMIN_ROLES);
const statusSchema = z.enum(ADMIN_STATUSES);
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(254)
  .email("Enter a valid email address.");
const displayNameSchema = z
  .string()
  .trim()
  .max(120, "Use 120 characters or fewer.")
  .optional()
  .transform((value) => value || null);

// New members join as Admin, Editor, or Viewer. Promoting someone to Super
// Admin is a separate, confirmed role change in the team list.
const inviteRoleSchema = z.enum(["admin", "editor", "viewer"], {
  errorMap: () => ({ message: "Choose Admin, Editor, or Viewer." }),
});

const inviteSchema = z.object({
  email: emailSchema,
  role: inviteRoleSchema,
  display_name: displayNameSchema,
});

const memberRoleSchema = z.object({ user_id: uuidSchema, role: roleSchema });
const memberStatusSchema = z.object({
  user_id: uuidSchema,
  status: statusSchema,
});
const memberSchema = z.object({ user_id: uuidSchema });
const profileSchema = z.object({
  user_id: uuidSchema,
  display_name: displayNameSchema,
});

function refresh() {
  revalidatePath("/admin/team");
  revalidatePath("/admin", "layout");
}

/** Where invitation and reset emails land. Prefers NEXT_PUBLIC_SITE_URL. */
function passwordRedirectUrl() {
  const headerList = headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto =
    headerList.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const origin = getSiteUrl(host ? `${proto}://${host}` : undefined);
  return `${origin}/admin/set-password`;
}

function describeAuthAdminError(error: {
  message?: string;
  status?: number;
  code?: string;
}) {
  const lower = (error.message ?? "").toLowerCase();

  if (
    error.status === 401 ||
    error.status === 403 ||
    error.code === "not_admin" ||
    lower.includes("invalid api key") ||
    lower.includes("not allowed")
  ) {
    return "Supabase rejected the server credentials. Check that SUPABASE_SERVICE_ROLE_KEY is this project's service_role (or sb_secret_) key.";
  }

  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Supabase is rate-limiting emails. Wait a few minutes, or configure custom SMTP in Supabase.";
  }

  if (lower.includes("redirect")) {
    return "Supabase rejected the redirect URL. Add /admin/set-password to the allowed Redirect URLs.";
  }

  if (lower.includes("invalid") && lower.includes("email")) {
    return "Supabase rejected that email address.";
  }

  return "Supabase could not send the email. Please try again.";
}

function isAlreadyRegistered(error: { message?: string; code?: string } | null) {
  const lower = (error?.message ?? "").toLowerCase();
  return (
    error?.code === "email_exists" ||
    lower.includes("already been registered") ||
    lower.includes("already registered")
  );
}

/** Recovery emails for users who already accepted an invitation. */
async function sendPasswordSetupEmail(email: string, redirectTo: string) {
  const env = getSupabasePublicEnv();
  const client = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        flowType: "implicit",
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
  return client.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function inviteTeamMember(
  formData: FormData
): Promise<TeamActionResult> {
  const auth = await checkPermission("users:manage");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { supabase } = auth;
  const parsed = inviteSchema.safeParse({
    email: formString(formData, "email"),
    role: formString(formData, "role") || "viewer",
    display_name: formString(formData, "display_name"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const { email, role, display_name } = parsed.data;

  // Database first, so nothing is emailed when the user is already on the
  // team or the migrations are missing. add_admin_user looks the user up in
  // auth.users by email and writes that exact UUID, re-checks that the caller
  // is a Super Admin, and the audit trigger records who did it.
  const addToTeam = (invited: boolean) =>
    supabase.rpc("add_admin_user", {
      p_email: email,
      p_role: role,
      p_display_name: display_name,
      p_invited: invited,
    });

  const existingLogin = await addToTeam(false);

  if (!existingLogin.error) {
    refresh();
    return {
      ok: true,
      id: String(existingLogin.data),
      message: `${email} already had a Supabase login and was added to the team. If they have never set a password, use "Resend invite" or "Send setup link" in the list.`,
    };
  }

  if (existingLogin.error.code !== "DT404") {
    return { ok: false, error: describeDbError(existingLogin.error) };
  }

  // No Auth user yet: create one by invitation.
  if (!hasSupabaseAdminAuth()) {
    return {
      ok: false,
      error:
        "No Supabase login exists for that email, and email invitations are off because SUPABASE_SERVICE_ROLE_KEY is not set on the server. Nothing was changed.",
    };
  }

  const invite = await createSupabaseAuthAdmin().inviteUserByEmail(email, {
    redirectTo: passwordRedirectUrl(),
    // Display only. The role lives in public.admin_users, never in metadata.
    data: display_name ? { display_name } : undefined,
  });

  if (invite.error) {
    // Someone created the login in the meantime: add it instead.
    if (isAlreadyRegistered(invite.error)) {
      const retry = await addToTeam(false);
      if (!retry.error) {
        refresh();
        return {
          ok: true,
          id: String(retry.data),
          message: `${email} already had a Supabase login and was added to the team.`,
        };
      }
      return { ok: false, error: describeDbError(retry.error) };
    }

    return {
      ok: false,
      error: `${describeAuthAdminError(invite.error)} Nothing was added to the team.`,
    };
  }

  const added = await addToTeam(true);

  if (added.error) {
    return {
      ok: false,
      error: `The invitation email was sent to ${email}, but adding them to the team failed: ${describeDbError(added.error)} Submit the form again to finish; their new login will be reused and no second email is sent.`,
    };
  }

  if (invite.data.user && String(added.data) !== invite.data.user.id) {
    return {
      ok: false,
      error:
        "The invited login and the team record do not match. Check Supabase Authentication for duplicate users with this email.",
    };
  }

  refresh();
  return {
    ok: true,
    id: String(added.data),
    message: `Invitation sent to ${email}. The email link lets them set a password and sign in.`,
  };
}

export async function resendTeamInvite(
  formData: FormData
): Promise<TeamActionResult> {
  const auth = await checkPermission("users:manage");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const { supabase } = auth;
  const parsed = memberSchema.safeParse({
    user_id: formString(formData, "user_id"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid team member." };
  }

  const { data: team, error: teamError } = await supabase.rpc(
    "list_admin_team"
  );
  if (teamError) {
    return { ok: false, error: describeDbError(teamError) };
  }

  const member = ((team ?? []) as any[]).find(
    (row) => row.user_id === parsed.data.user_id
  );
  if (!member) {
    return { ok: false, error: "Team member not found." };
  }

  if (member.status !== "active") {
    return { ok: false, error: "Restore this member's access before sending a link." };
  }

  const redirectTo = passwordRedirectUrl();
  const pending = !member.email_confirmed_at;

  if (pending) {
    if (!hasSupabaseAdminAuth()) {
      return {
        ok: false,
        error:
          "Resending invitations needs SUPABASE_SERVICE_ROLE_KEY on the server. You can resend it from Supabase Authentication instead.",
      };
    }

    const { error } = await createSupabaseAuthAdmin().inviteUserByEmail(
      member.email,
      { redirectTo }
    );

    // A user who confirmed in the meantime gets a setup link instead.
    if (error && !isAlreadyRegistered(error)) {
      return { ok: false, error: describeAuthAdminError(error) };
    }

    if (error) {
      const reset = await sendPasswordSetupEmail(member.email, redirectTo);
      if (reset.error) {
        return { ok: false, error: describeAuthAdminError(reset.error) };
      }
    }
  } else {
    const { error } = await sendPasswordSetupEmail(member.email, redirectTo);
    if (error) {
      return { ok: false, error: describeAuthAdminError(error) };
    }
  }

  const { error: recordError } = await supabase.rpc("record_admin_invite", {
    p_user_id: member.user_id,
  });
  if (recordError) {
    return { ok: false, error: describeDbError(recordError) };
  }

  refresh();
  return {
    ok: true,
    id: member.user_id,
    message: pending
      ? `Invitation re-sent to ${member.email}.`
      : `Password setup link sent to ${member.email}.`,
  };
}

export async function updateTeamMemberRole(
  formData: FormData
): Promise<TeamActionResult> {
  const auth = await checkPermission("users:manage");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const { supabase, user } = auth;
  const parsed = memberRoleSchema.safeParse({
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

  if (parsed.data.user_id === user.id) {
    return { ok: false, error: "You cannot change your own role." };
  }

  const { error } = await supabase.rpc("set_admin_role", {
    p_user_id: parsed.data.user_id,
    p_role: parsed.data.role,
  });

  if (error) {
    return { ok: false, error: describeDbError(error) };
  }

  refresh();
  return { ok: true, id: parsed.data.user_id, message: "Role saved." };
}

export async function setTeamMemberStatus(
  formData: FormData
): Promise<TeamActionResult> {
  const auth = await checkPermission("users:manage");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const { supabase, user } = auth;
  const parsed = memberStatusSchema.safeParse({
    user_id: formString(formData, "user_id"),
    status: formString(formData, "status"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid team member or status." };
  }

  if (parsed.data.user_id === user.id) {
    return { ok: false, error: "You cannot suspend your own access." };
  }

  const { error } = await supabase.rpc("set_admin_status", {
    p_user_id: parsed.data.user_id,
    p_status: parsed.data.status,
  });

  if (error) {
    if (error.code === "PGRST202") {
      return {
        ok: false,
        error: "Apply the team-access database migration before suspending access.",
      };
    }
    return { ok: false, error: describeDbError(error) };
  }

  refresh();
  return {
    ok: true,
    id: parsed.data.user_id,
    message:
      parsed.data.status === "active" ? "Access restored." : "Access suspended.",
  };
}

export async function removeTeamMember(
  formData: FormData
): Promise<TeamActionResult> {
  const auth = await checkPermission("users:manage");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const { supabase, user } = auth;
  const parsed = memberSchema.safeParse({
    user_id: formString(formData, "user_id"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid team member." };
  }

  if (parsed.data.user_id === user.id) {
    return { ok: false, error: "You cannot remove your own access." };
  }

  const { error } = await supabase.rpc("remove_admin_user", {
    p_user_id: parsed.data.user_id,
  });

  if (error) {
    return { ok: false, error: describeDbError(error) };
  }

  refresh();
  return { ok: true, id: parsed.data.user_id, message: "Team access removed." };
}

/**
 * Display-name edits. Super Admins can edit anyone; everyone else can only
 * edit themselves, which the database enforces again.
 */
export async function updateTeamMemberProfile(
  formData: FormData
): Promise<TeamActionResult> {
  const auth = await checkPermission();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const { supabase, user, admin } = auth;
  const parsed = profileSchema.safeParse({
    user_id: formString(formData, "user_id"),
    display_name: formString(formData, "display_name"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  if (parsed.data.user_id !== user.id && !hasPermission(admin.role, "users:manage")) {
    return { ok: false, error: "You can only edit your own profile." };
  }

  const { error } = await supabase.rpc("update_admin_profile", {
    p_user_id: parsed.data.user_id,
    p_display_name: parsed.data.display_name,
  });

  if (error) {
    if (error.code === "PGRST202") {
      return {
        ok: false,
        error: "Apply the team-access database migration before editing profiles.",
      };
    }
    return { ok: false, error: describeDbError(error) };
  }

  refresh();
  revalidatePath("/admin/account");
  return { ok: true, id: parsed.data.user_id, message: "Profile saved." };
}
