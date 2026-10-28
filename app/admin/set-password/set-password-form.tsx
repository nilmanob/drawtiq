"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

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
    lower.includes("token has expired")
  ) {
    return "This password link is invalid or has expired. Request a new link.";
  }

  return message;
}

function readInitialError() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return (
    hash.get("error_description") ??
    search.get("error_description") ??
    hash.get("error") ??
    search.get("error")
  );
}

function clearAuthParams() {
  const url = new URL(window.location.href);
  [
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
  ].forEach((key) => {
    url.searchParams.delete(key);
  });
  url.hash = "";
  window.history.replaceState({}, "", `${url.pathname}${url.search}`);
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
    const initialError = readInitialError();
    const search = new URLSearchParams(window.location.search);
    const tokenHash = search.get("token_hash");
    const otpType = search.get("type");
    const supabase = createSupabaseBrowserClient();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) {
          return;
        }

        if (session) {
          setEmail(session.user.email ?? null);
          setStatus("ready");
          setError(null);
        }
      }
    );

    async function checkSession() {
      if (initialError) {
        if (active) {
          setError(friendlyAuthError(initialError));
          setStatus("invalid");
          clearAuthParams();
        }
        return;
      }

      if (tokenHash && otpType) {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType as EmailOtpType,
        });

        if (!active) {
          return;
        }

        if (verifyError) {
          setError(friendlyAuthError(verifyError.message));
          setStatus("invalid");
          clearAuthParams();
          return;
        }

        setEmail(data.user?.email ?? null);
        setStatus("ready");
        clearAuthParams();
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (sessionError || !data.session) {
        setError(friendlyAuthError(sessionError?.message));
        setStatus("invalid");
        clearAuthParams();
        return;
      }

      setEmail(data.session.user.email ?? null);
      setStatus("ready");
      clearAuthParams();
    }

    void checkSession();

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The two passwords do not match.");
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

      clearAuthParams();
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
          Request a new invite or recovery link from the Supabase dashboard, or
          use the password reset option on the sign-in page.
        </p>
        <a className="admin-button" href="/admin/login">
          Return to sign in
        </a>
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
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
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
