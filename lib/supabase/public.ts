import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  PUBLIC_CONTENT_REVALIDATE,
  PUBLIC_CONTENT_TAG,
} from "@/lib/content/cache";
import { getSupabasePublicEnv } from "@/lib/env";

let publicClient: SupabaseClient | undefined;

/**
 * Read-only Supabase client for public content.
 *
 * This intentionally does not read auth cookies, so public pages can be
 * statically rendered and revalidated. Row Level Security still limits the
 * anon key to published content.
 */
export function getSupabasePublicClient(): SupabaseClient {
  if (publicClient) {
    return publicClient;
  }

  const env = getSupabasePublicEnv();

  publicClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        // Let Next cache and tag PostgREST GETs with the same window as the
        // public pages. Admin actions revalidate the tag on publish/update.
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            next: {
              revalidate: PUBLIC_CONTENT_REVALIDATE,
              tags: [PUBLIC_CONTENT_TAG],
            },
          }),
      },
    }
  );

  return publicClient;
}
