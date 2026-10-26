"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";

let browserClient: SupabaseClient | undefined;

/**
 * Browser Supabase client.
 *
 * Uses only the public URL and anon key. Authorization is enforced by RLS in
 * Postgres, so this client is safe to ship to the browser.
 */
export function createSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const env = getSupabasePublicEnv();

  browserClient = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return browserClient;
}
