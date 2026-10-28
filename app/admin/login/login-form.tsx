"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function describeSignInError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }

  if (lower.includes("email not confirmed")) {
    return "Confirm your email first. Check your invitation or confirmation email.";
  }

  if (
    lower.includes("rate limit") ||
    lower.includes("too many") ||
    lower.includes("security purposes")
  ) {
    return "Too many sign-in attempts. Wait a minute and try again.";
  }

  return message;
}

export function LoginForm({
  initialEmail = "",
  nextPath,
  onForgotPassword,
}: {
  initialEmail?: string;
  nextPath: string;
  onForgotPassword: (email: string) => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(
          signInError.message
            ? describeSignInError(signInError.message)
            : "Email or password is incorrect."
        );
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Could not reach the authentication service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
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

      <div className="admin-field">
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          className="admin-input"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
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
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <button
        className="admin-recovery-link"
        type="button"
        onClick={() => onForgotPassword(email)}
      >
        Forgot your password?
      </button>
    </form>
  );
}
