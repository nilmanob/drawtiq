import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import {
  hasPermission,
  isAdminRole,
  type AdminPermission,
  type AdminRole,
} from "@/lib/auth/roles";

export type AdminRecord = {
  user_id: string;
  email: string;
  role: AdminRole;
};

export type AdminSession = {
  configured: boolean;
  user: User | null;
  admin: AdminRecord | null;
};

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
    .select("user_id, email, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!error && data) {
    return {
      user_id: data.user_id,
      email: data.email,
      role: isAdminRole(data.role) ? data.role : "viewer",
    };
  }

  // The role migration may not be applied yet. Existing allowlisted accounts
  // were full admins before roles existed, so keep them working as owners
  // until the migration is applied.
  if (error?.code === "42703" || error?.code === "PGRST204") {
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
    };
  }

  return null;
});

export async function getAdminSession(): Promise<AdminSession> {
  const configured = hasSupabaseEnv();

  if (!configured) {
    return { configured: false, user: null, admin: null };
  }

  const user = await getCurrentUser();
  const admin = user ? await getAdminRecord() : null;

  return { configured: true, user, admin };
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
