"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateTeamMemberProfile } from "../team/actions";

export function ProfileForm({
  userId,
  displayName,
}: {
  userId: string;
  displayName: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("user_id", userId);
      const result = await updateTeamMemberProfile(formData);

      if (!result.ok) {
        setError(result.fieldErrors?.display_name?.[0] ?? result.error);
        return;
      }

      setMessage(result.message);
      router.refresh();
    } catch {
      setError("The request failed. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label htmlFor="account-name">Display name</label>
        <input
          id="account-name"
          className="admin-input"
          name="display_name"
          defaultValue={displayName ?? ""}
          maxLength={120}
          autoComplete="name"
        />
        <p className="admin-field-hint">
          Shown to other team members. Your role can only be changed by
          another Super Admin.
        </p>
      </div>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="admin-inline-success" role="status">
          {message}
        </p>
      ) : null}

      <div>
        <button className="admin-button admin-button-secondary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}
