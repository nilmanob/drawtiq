import { z } from "zod";

/**
 * Public Supabase values. These are safe to expose to the browser; access is
 * controlled by Row Level Security, never by hiding the anon key.
 */
function looksLikeServiceRoleKey(key: string) {
  if (key.startsWith("sb_secret_")) {
    return true;
  }

  // Decode legacy Supabase JWTs just enough to catch a service_role key that
  // was accidentally placed in a NEXT_PUBLIC_ variable.
  const parts = key.split(".");
  if (parts.length !== 3) {
    return false;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const payload = JSON.parse(atob(padded)) as { role?: unknown };

    return payload.role === "service_role";
  } catch {
    return false;
  }
}

const supabasePublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(20)
    .refine(
      (key) => !looksLikeServiceRoleKey(key),
      "NEXT_PUBLIC_SUPABASE_ANON_KEY must be the anon or publishable key, never a service_role or secret key."
    ),
});

export type SupabasePublicEnv = z.infer<typeof supabasePublicEnvSchema>;

/**
 * Read and validate the public Supabase environment lazily.
 *
 * This deliberately does not run at module load so `next build` and the public
 * site can still work before Supabase has been configured. Routes that need
 * Supabase call this at request time and show a setup message if it is missing.
 */
export function getSupabasePublicEnv(): SupabasePublicEnv {
  const parsed = supabasePublicEnvSchema.safeParse({
    // Keep these as direct property reads so Next can inline NEXT_PUBLIC_*
    // values into the browser bundle.
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (and in Netlify environment variables)."
    );
  }

  return parsed.data;
}

export function hasSupabaseEnv(): boolean {
  return supabasePublicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }).success;
}
