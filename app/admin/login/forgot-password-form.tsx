"use client";

import { useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/admin/set-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch {
      setError("Could not reach the authentication service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <p className="admin-inline-success" role="status" aria-live="polite">
        If that email matches an admin account, a password reset link is on its
        way.
      </p>
    );
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label htmlFor="reset-email">Admin email</label>
        <input
          id="reset-email"
          className="admin-input"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
    </form>
  );
}
