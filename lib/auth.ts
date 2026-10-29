import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import {
  hasPermission,
  isAdminRole,
  isAdminStatus,
  type AdminPermission,
  type AdminRole,
  type AdminStatus,
} from "@/lib/auth/roles";

export type AdminRecord = {
  user_id: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  display_name: string | null;
};

export type AdminSession = {
  configured: boolean;
  user: User | null;
  /** Only set for an active team member. */
  admin: AdminRecord | null;
  /** True when the user is on the team but their access is suspended. */
  suspended: boolean;
};

function isMissingColumn(code: string | undefined) {
  return code === "42703" || code === "PGRST204";
}

/**
 * Read the authenticated user on the server. This validates the JWT with
 * Supabase rather than trusting a cookie value.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
});

/**
 * A team member is an auth user with a row in public.admin_users. Roles are
 * stored in the database so they can be changed without editing the user's
 * mutable profile metadata. The table is managed by owners, not end users.
 */
export const getAdminRecord = cache(async (): Promise<AdminRecord | null> => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id, email, role, status, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!error) {
    return data
      ? {
          user_id: data.user_id,
          email: data.email,
          role: isAdminRole(data.role) ? data.role : "viewer",
          // Fail closed: an unknown status is treated as suspended.
          status: isAdminStatus(data.status) ? data.status : "suspended",
          display_name: data.display_name ?? null,
        }
      : null;
  }

  if (!isMissingColumn(error.code)) {
    return null;
  }

  // The team-access migration (status column) may not be applied yet. Every
  // allowlisted member was active before it existed.
  const withRole = await supabase
    .from("admin_users")
    .select("user_id, email, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!withRole.error) {
    return withRole.data
      ? {
          user_id: withRole.data.user_id,
          email: withRole.data.email,
          role: isAdminRole(withRole.data.role) ? withRole.data.role : "viewer",
          status: "active",
          display_name: null,
        }
      : null;
  }

  if (!isMissingColumn(withRole.error.code)) {
    return null;
  }

  // The role migration may not be applied yet either. Existing allowlisted
  // accounts were full admins before roles existed, so keep them working as
  // owners until the migration is applied.
  const fallback = await supabase
    .from("admin_users")
    .select("user_id, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fallback.error || !fallback.data) {
    return null;
  }

  return {
    user_id: fallback.data.user_id,
    email: fallback.data.email,
    role: "owner",
    status: "active",
    display_name: null,
  };
});

export async function getAdminSession(): Promise<AdminSession> {
  const configured = hasSupabaseEnv();

  if (!configured) {
    return { configured: false, user: null, admin: null, suspended: false };
  }

  const user = await getCurrentUser();
  const record = user ? await getAdminRecord() : null;
  const active = record?.status === "active" ? record : null;

  return {
    configured: true,
    user,
    admin: active,
    suspended: Boolean(record && !active),
  };
}

/**
 * Use in Server Actions or other server mutations. RLS is the final boundary;
 * this gives callers a clear failure before doing work.
 */
export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session.configured) {
    throw new Error("Supabase is not configured.");
  }

  if (!session.user) {
    redirect("/admin/login");
  }

  if (!session.admin) {
    throw new Error("Forbidden: admin access required.");
  }

  return {
    user: session.user,
    admin: session.admin,
    supabase: createSupabaseServerClient(),
  };
}

export async function requirePermission(permission: AdminPermission) {
  const session = await requireAdmin();

  if (!hasPermission(session.admin.role, permission)) {
    throw new Error("Forbidden: your role does not allow this action.");
  }

  return session;
}

export type PermissionCheck =
  | {
      ok: true;
      user: User;
      admin: AdminRecord;
      supabase: ReturnType<typeof createSupabaseServerClient>;
    }
  | { ok: false; error: string };

/**
 * Non-throwing variant for server actions that return a result to the UI.
 * Next.js hides thrown messages in production, so a denied request would
 * otherwise surface only as a generic failure.
 */
export async function checkPermission(
  permission?: AdminPermission
): Promise<PermissionCheck> {
  const session = await getAdminSession();

  if (!session.configured) {
    return { ok: false, error: "Supabase is not configured on the server." };
  }

  if (!session.user) {
    return { ok: false, error: "Your session has ended. Sign in again." };
  }

  if (!session.admin) {
    return {
      ok: false,
      error: session.suspended
        ? "Your admin access is suspended."
        : "Your account is not on the admin team.",
    };
  }

  if (permission && !hasPermission(session.admin.role, permission)) {
    return { ok: false, error: "Your role does not allow this action." };
  }

  return {
    ok: true,
    user: session.user,
    admin: session.admin,
    supabase: createSupabaseServerClient(),
  };
}

/**
 * Use in protected page layouts that should be unavailable to read-only roles.
 * The parent admin layout already handles signed-out and non-allowlisted users.
 */
export async function requirePagePermission(permission: AdminPermission) {
  const session = await getAdminSession();

  if (!session.configured) {
    redirect("/admin/login?setup=1");
  }

  if (!session.user) {
    redirect("/admin/login");
  }

  if (!session.admin) {
    redirect("/admin");
  }

  if (!hasPermission(session.admin.role, permission)) {
    redirect("/admin");
  }

  return session;
}
