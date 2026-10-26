import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";

export type AdminSession = {
  configured: boolean;
  user: User | null;
  admin: { user_id: string; email: string } | null;
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
 * An admin is an auth user with a row in public.admin_users. The table is
 * managed manually (dashboard/SQL/service role), not by end users.
 */
export const getAdminRecord = cache(async () => {
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
    .select("user_id, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
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
