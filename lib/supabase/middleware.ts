import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv, hasSupabaseEnv } from "@/lib/env";

const LOGIN_PATH = "/admin/login";
// Reachable without a session: their sessions arrive in the email link, or
// they exist to request one.
const PUBLIC_ADMIN_PATHS = new Set([
  LOGIN_PATH,
  "/admin/set-password",
  "/admin/forgot-password",
]);

// Friendly auth URLs. Handled here rather than in next.config.js because
// Netlify runs middleware at the edge before config redirects, which sent
// these to the login screen. Browsers keep the #fragment across a redirect,
// so recovery tokens survive.
const ADMIN_ALIASES: Record<string, string> = {
  "/admin/reset-password": "/admin/set-password",
  "/admin/update-password": "/admin/account",
};

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * Refresh the Supabase auth cookie on admin requests and gate unauthenticated
 * visitors before they reach the protected admin layout.
 *
 * Role checks are intentionally not done here: they require a database read
 * and are enforced again in the server layout and by RLS.
 */
export async function updateSession(request: NextRequest) {
  const alias = ADMIN_ALIASES[request.nextUrl.pathname.replace(/\/$/, "")];
  if (alias) {
    const url = request.nextUrl.clone();
    url.pathname = alias;
    return NextResponse.redirect(url, 307);
  }

  // Keep the public site and the admin setup screen usable before Supabase is
  // configured. The protected layout will redirect to the setup screen.
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const env = getSupabasePublicEnv();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Already signed in: do not show the login form again.
  if (user && pathname === LOGIN_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  // Unauthenticated admin request: send to login and preserve the destination.
  // The password screen is public because its session arrives in the URL and
  // is only written to cookies by the browser or callback after this runs.
  if (
    !user &&
    isAdminPath(pathname) &&
    !PUBLIC_ADMIN_PATHS.has(pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "";
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}
