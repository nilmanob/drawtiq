import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabasePublicEnv, hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

const PASSWORD_PATH = "/admin/set-password";

function safeNextPath(value: string | null) {
  if (
    !value ||
    value.startsWith("//") ||
    (value !== "/admin" && !value.startsWith("/admin/"))
  ) {
    return PASSWORD_PATH;
  }

  return value;
}

function redirectWithCookies(
  request: NextRequest,
  path: string,
  cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
) {
  const response = NextResponse.redirect(new URL(path, request.url));
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

function callbackError(message: string) {
  const params = new URLSearchParams({
    error: "auth_callback_failed",
    error_description: message,
  });
  return `${PASSWORD_PATH}?${params.toString()}`;
}

/**
 * Completes PKCE and token-hash email links on the server, writes the session
 * cookies, then sends the visitor to the password screen. Implicit-flow links
 * (the Supabase default for dashboard invites and recovery emails) are handled
 * by AuthLinkRedirect in the browser instead.
 */
export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/admin/login?setup=1", request.url));
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const cookiesToSet: {
    name: string;
    value: string;
    options?: CookieOptions;
  }[] = [];

  const env = getSupabasePublicEnv();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(items) {
          items.forEach(({ name, value, options }) => {
            cookiesToSet.push({ name, value, options });
          });
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return redirectWithCookies(
        request,
        callbackError("This sign-in link is invalid or has expired."),
        cookiesToSet
      );
    }

    return redirectWithCookies(request, next, cookiesToSet);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });

    if (error) {
      return redirectWithCookies(
        request,
        callbackError("This sign-in link is invalid or has expired."),
        cookiesToSet
      );
    }

    return redirectWithCookies(request, next, cookiesToSet);
  }

  return redirectWithCookies(
    request,
    callbackError("This link is missing its sign-in token."),
    cookiesToSet
  );
}
