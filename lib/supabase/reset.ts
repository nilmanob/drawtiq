"use client";

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";

/**
 * Reset-email client.
 *
 * The normal @supabase/ssr browser client uses PKCE, whose verifier is stored
 * in the browser (and on the origin) that requested the email. Opening the link
 * on another device, or a local request pointing the email at the live site,
 * would then fail. This client asks Supabase for an implicit-flow recovery link
 * instead, so the password screen can consume the session anywhere.
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
