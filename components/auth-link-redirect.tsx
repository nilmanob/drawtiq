"use client";

import { useEffect } from "react";

const SKIP_PATHS = new Set(["/admin/set-password", "/auth/callback"]);

function authParams(search: string, hash: string) {
  const searchParams = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  return { searchParams, hashParams };
}

/**
 * Supabase email links default to the project's Site URL when no redirect is
 * configured, which drops invite/recovery tokens on the public homepage. Move
 * those tokens to the password screen before any client code discards them.
 *
 * The access token can arrive in the URL fragment (implicit flow) or the query
 * string. PKCE and token-hash links go through the server callback first.
 */
export function AuthLinkRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const { pathname, search, hash } = window.location;
    if (SKIP_PATHS.has(pathname)) {
      return;
    }

    const { searchParams, hashParams } = authParams(search, hash);
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = hashParams.get("type") ?? searchParams.get("type");
    const errorCode =
      hashParams.get("error_code") ?? searchParams.get("error_code");
    const errorDescription =
      hashParams.get("error_description") ??
      searchParams.get("error_description");
    const accessToken =
      hashParams.get("access_token") ?? searchParams.get("access_token");
    const refreshToken =
      hashParams.get("refresh_token") ?? searchParams.get("refresh_token");

    if (code || tokenHash) {
      const callbackParams = new URLSearchParams(search);
      callbackParams.delete("next");
      callbackParams.set("next", "/admin/set-password");
      window.location.replace(`/auth/callback?${callbackParams.toString()}`);
      return;
    }

    const isPasswordFlow = !type || type === "invite" || type === "recovery";
    const hasTokens = Boolean(accessToken || refreshToken);
    const hasAuthError = Boolean(errorCode || errorDescription);

    if (hasAuthError || (hasTokens && isPasswordFlow)) {
      window.location.replace(`/admin/set-password${search}${hash}`);
    }
  }, []);

  return null;
}
