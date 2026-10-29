"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { validateNewPassword } from "@/lib/auth/password";

type Status = "checking" | "ready" | "invalid" | "success";

function friendlyAuthError(message: string | undefined) {
  if (!message) {
    return "This password link is invalid or has expired. Request a new link.";
  }

  const lower = message.toLowerCase();
  if (
    lower.includes("session missing") ||
    lower.includes("invalid") ||
    lower.includes("expired") ||
    lower.includes("token has expired") ||
    lower.includes("not found") ||
    lower.includes("jwt") ||
    lower.includes("refresh token") ||
    lower.includes("otp") ||
    lower.includes("code verifier") ||
    lower.includes("auth code")
  ) {
    return "This password link is invalid or has expired. Request a new link.";
  }

  if (lower.includes("same") && lower.includes("password")) {
    return "Choose a password that is different from your current one.";
  }

  if (lower.includes("weak") || lower.includes("pwned")) {
    return "That password is too weak or has appeared in a data breach. Choose another.";
  }

  return message;
}

type AuthLink = {
  error: string | null;
  code: string | null;
  tokenHash: string | null;
  otpType: string | null;
  accessToken: string | null;
  refreshToken: string | null;
};

const AUTH_PARAMS = [
  "access_token",
  "refresh_token",
  "expires_in",
  "expires_at",
  "token_type",
  "provider_token",
  "provider_refresh_token",
  "code",
  "token_hash",
  "type",
  "error",
  "error_code",
  "error_description",
  "sb",
];

/**
 * Read every supported email-link format, then remove it from the address bar
 * before a Supabase client is created. The SSR browser client only accepts
 * PKCE links and rejects implicit-flow fragments (dashboard invites, Team
 * invitations and cross-origin recovery emails), so this screen completes each
 * format itself. Scrubbing first also keeps tokens out of history and
 * referrers.
 */
function takeAuthLink(): AuthLink {
  const url = new URL(window.location.href);
  const search = url.searchParams;
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const read = (key: string) => hash.get(key) ?? search.get(key);

  const link: AuthLink = {
    error: read("error_description") ?? read("error"),
    code: search.get("code"),
    tokenHash: search.get("token_hash"),
    otpType: read("type"),
    accessToken: hash.get("access_token"),
    refreshToken: hash.get("refresh_token"),
  };

  AUTH_PARAMS.forEach((key) => search.delete(key));
  url.hash = "";
  window.history.replaceState({}, "", `${url.pathname}${url.search}`);

  return link;
}

type LinkResult =
  | { ok: true; email: string | null }
  | { ok: false; message: string | undefined };

let linkCheck: Promise<LinkResult> | null = null;

async function completeAuthLink(): Promise<LinkResult> {
  const link = takeAuthLink();
  const supabase = createSupabaseBrowserClient();

  if (link.error) {
    return { ok: false, message: link.error };
  }

  // Implicit flow: Supabase validates the access token before it is stored,
  // so a forged or expired fragment cannot create a session.
  if (link.accessToken && link.refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: link.accessToken,
      refresh_token: link.refreshToken,
    });
    return error || !data.session
      ? { ok: false, message: error?.message }
      : { ok: true, email: data.session.user.email ?? null };
  }

  if (link.tokenHash && link.otpType) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: link.tokenHash,
      type: link.otpType as EmailOtpType,
    });
    return error
      ? { ok: false, message: error.message }
      : { ok: true, email: data.user?.email ?? null };
  }

  // PKCE: only works in the browser that requested the email, because the
  // code verifier is stored there.
  if (link.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(link.code);
    if (error || !data.session) {
      return {
        ok: false,
        message: error?.message?.toLowerCase().includes("verifier")
          ? "Open the link in the same browser you requested it from, or request a new link."
          : error?.message,
      };
    }
    return { ok: true, email: data.session.user.email ?? null };
  }

  // No link: allow an existing session (for example after /auth/callback wrote
  // the cookies). getUser validates it with Supabase.
  const { data, error } = await supabase.auth.getUser();
  return error || !data.user
    ? { ok: false, message: undefined }
    : { ok: true, email: data.user.email ?? null };
}

/**
 * Links are single-use, so run the check once per page load even when React
 * mounts the effect twice in development.
 */
function completeAuthLinkOnce() {
  linkCheck ??= completeAuthLink().catch(() => ({
    ok: false as const,
    message: "Could not reach the authentication service. Please try again.",
  }));
  return linkCheck;
}

export function SetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let active = true;

    void completeAuthLinkOnce().then((result) => {
      if (!active) {
        return;
      }

      if (result.ok) {
        setEmail(result.email);
        setError(null);
        setStatus("ready");
      } else {
        setError(friendlyAuthError(result.message));
        setStatus("invalid");
      }
    });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateNewPassword(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(friendlyAuthError(updateError.message));
        return;
      }

      // Sign out any other session that may still hold the old password.
      await supabase.auth.signOut({ scope: "others" }).catch(() => undefined);

      setStatus("success");
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        router.replace("/admin");
        router.refresh();
      }, 1200);
    } catch {
      setError("Could not reach the authentication service. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "checking") {
    return (
      <p className="admin-note" role="status" aria-live="polite">
        Checking your invite or recovery link…
      </p>
    );
  }

  if (status === "success") {
    return (
      <div className="admin-setup" role="status" aria-live="polite">
        <strong>Password updated.</strong>
        <p>Opening the admin dashboard…</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <>
        <p className="admin-error" role="alert" aria-live="polite">
          {error ?? "This password link is invalid or has expired."}
        </p>
        <p className="admin-note">
          Links expire after a short time and can only be used once. Request a
          new reset link, or ask a Super Admin to resend your invitation.
        </p>
        <div className="admin-auth-actions">
          <a className="admin-button" href="/admin/forgot-password">
            Request a new link
          </a>
          <a className="admin-button admin-button-secondary" href="/admin/login">
            Return to sign in
          </a>
        </div>
      </>
    );
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {email ? (
        <p className="admin-note">
          Signed in as <strong>{email}</strong>. Choose a password for this
          account.
        </p>
      ) : null}

      <div className="admin-field">
        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          className="admin-input"
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <p className="admin-field-hint">
          At least 8 characters, with a letter and a number.
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor="confirm-password">Confirm new password</label>
        <input
          id="confirm-password"
          className="admin-input"
          type={showPassword ? "text" : "password"}
          name="confirm-password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>

      <label className="admin-check" htmlFor="show-password">
        <input
          id="show-password"
          type="checkbox"
          checked={showPassword}
          onChange={(event) => setShowPassword(event.target.checked)}
        />
        Show passwords
      </label>

      {error ? (
        <p className="admin-error" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      <button className="admin-button" type="submit" disabled={saving}>
        {saving ? "Saving password…" : "Save password"}
      </button>
    </form>
  );
}
