import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";

/**
 * Privileged Supabase Auth client.
 *
 * The service-role key bypasses RLS, so this module is server-only, the key is
 * never prefixed with NEXT_PUBLIC_, and the client is used for exactly one
 * thing: Auth Admin calls (inviting users) that have no RLS equivalent. Every
 * caller must check the signed-in user's permission first, and team rows are
 * still written through the owner-checked database functions with the
 * caller's own session, so the database audit log records the real actor.
 */
export function getServiceRoleKey(): string | null {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    "";

  return key.length >= 20 ? key : null;
}

export function hasSupabaseAdminAuth(): boolean {
  return getServiceRoleKey() !== null;
}

export function createSupabaseAuthAdmin(): SupabaseClient["auth"]["admin"] {
  const key = getServiceRoleKey();
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured on the server."
    );
  }

  const env = getSupabasePublicEnv();
  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // Only expose the Auth Admin API, not table access with RLS bypassed.
  return client.auth.admin;
}
