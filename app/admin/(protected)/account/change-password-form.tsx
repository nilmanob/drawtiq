"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { validateNewPassword } from "@/lib/auth/password";

function describeUpdateError(message: string | undefined) {
  const lower = (message ?? "").toLowerCase();

  if (lower.includes("same") && lower.includes("password")) {
    return "Choose a password that is different from your current one.";
  }

  if (lower.includes("weak") || lower.includes("pwned")) {
    return "That password is too weak or has appeared in a data breach. Choose another.";
  }

  if (lower.includes("reauthenticat")) {
    return "For security, sign out and sign in again, then change your password.";
  }

  return "Your password could not be updated. Please try again.";
}

export function ChangePasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }

    const validationError = validateNewPassword(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);

    try {
      const supabase = createSupabaseBrowserClient();

      // Supabase does not ask for the old password on update, so confirm it
      // first. This also gives a fresh session for "secure password change".
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (verifyError) {
        setError(
          verifyError.message.toLowerCase().includes("invalid login")
            ? "Your current password is incorrect."
            : "Could not verify your current password. Try again in a minute."
        );
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(describeUpdateError(updateError.message));
        return;
      }

      await supabase.auth.signOut({ scope: "others" }).catch(() => undefined);

      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not reach the authentication service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label htmlFor="current-password">Current password</label>
        <input
          id="current-password"
          className="admin-input"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </div>

      <div className="admin-field">
        <label htmlFor="account-new-password">New password</label>
        <input
          id="account-new-password"
          className="admin-input"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <p className="admin-field-hint">
          At least 8 characters, with a letter and a number. Other signed-in
          devices are signed out after the change.
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor="account-confirm-password">Confirm new password</label>
        <input
          id="account-confirm-password"
          className="admin-input"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>

      <label className="admin-check" htmlFor="account-show-password">
        <input
          id="account-show-password"
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
      {saved ? (
        <p className="admin-inline-success" role="status">
          Password updated.
        </p>
      ) : null}

      <div>
        <button className="admin-button" type="submit" disabled={pending}>
          {pending ? "Updating password…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
