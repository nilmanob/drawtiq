"use client";

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";

/**
 * Reset-email client for cross-origin redirects.
 *
 * The normal @supabase/ssr browser client uses PKCE, whose verifier is stored
 * on the origin that requested the email. If a local request points the email
 * at the live site, that verifier does not exist there. This client asks
 * Supabase for an implicit-flow recovery link instead, so the live password
 * screen can consume the returned session on any domain.
 */
export function createPasswordResetClient() {
  const env = getSupabasePublicEnv();

  return createClient(
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
}
