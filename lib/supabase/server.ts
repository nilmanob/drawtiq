import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/env";

/**
 * Server Supabase client for Server Components, Route Handlers and Server
 * Actions. It reads the auth cookies set by the browser client / middleware.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const env = getSupabasePublicEnv();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies. The middleware refreshes
            // the session instead; this catch keeps reads safe.
          }
        },
      },
    }
  );
}
