"use client";

import { useState, type FormEvent } from "react";
import { createPasswordResetClient } from "@/lib/supabase/reset";
import { getSiteUrl } from "@/lib/site-url";

function describeResetError(message: string) {
  const lower = message.toLowerCase();

  if (
    lower.includes("rate limit") ||
    lower.includes("too many") ||
    lower.includes("security purposes")
  ) {
    return "Too many reset emails. Wait a minute and try again.";
  }

  if (lower.includes("invalid email") || lower.includes("email address")) {
    return "Enter a valid email address.";
  }

  return "We could not send the reset email. Please try again.";
}

export function ForgotPasswordForm({
  initialEmail = "",
  onBack,
}: {
  initialEmail?: string;
  onBack?: (email?: string) => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = email.trim();

    setError(null);
    setLoading(true);

    try {
      // Always request an implicit-flow link. A PKCE link only works in the
      // browser that asked for it, so opening the email on a phone or from a
      // local build would fail. The password screen scrubs the token from the
      // URL before using it.
      const redirectTo = `${getSiteUrl(window.location.origin)}/admin/set-password`;
      const supabase = createPasswordResetClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        nextEmail,
        { redirectTo }
      );

      if (resetError) {
        setError(
          resetError.message
            ? describeResetError(resetError.message)
            : "We could not send the reset email. Please try again."
        );
        return;
      }

      setEmail(nextEmail);
      setSent(true);
    } catch {
      setError("Could not reach the authentication service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="admin-reset-success" role="status" aria-live="polite">
        <p>
          Password reset link sent. If an account exists for{" "}
          <strong>{email}</strong>, check your inbox and spam folder.
        </p>
        {onBack ? (
          <button
            className="admin-button admin-button-secondary"
            type="button"
            onClick={() => onBack(email)}
          >
            Back to sign in
          </button>
        ) : (
          <a className="admin-button admin-button-secondary" href="/admin/login">
            Back to sign in
          </a>
        )}
      </div>
    );
  }

  return (
    <form className="admin-form admin-reset-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label htmlFor="reset-email">Admin email</label>
        <input
          id="reset-email"
          className="admin-input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
        />
      </div>

      {error ? (
        <p className="admin-error" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      <button className="admin-button" type="submit" disabled={loading}>
        {loading ? "Sending link…" : "Send reset link"}
      </button>

      {onBack ? (
        <button
          className="admin-reset-back"
          type="button"
          onClick={() => onBack(email.trim())}
        >
          Back to sign in
        </button>
      ) : (
        <a className="admin-reset-back" href="/admin/login">
          Back to sign in
        </a>
      )}
    </form>
  );
}
