"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_ROLE_OPTIONS } from "@/lib/auth/roles";
import type { AdminTeamMember } from "@/lib/admin/types";
import {
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
} from "./actions";

export function AddTeamMemberForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const result = await addTeamMember(new FormData(form));

      if (!result.ok) {
        setError(result.error);
        return;
      }

      form.reset();
      setMessage("Team member added.");
      router.refresh();
    } catch {
      setError("The request failed. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-team-add" onSubmit={handleSubmit}>
      <div className="admin-form-grid">
        <div className="admin-form-field">
          <label htmlFor="team-email">Existing auth user email</label>
          <input
            id="team-email"
            className="admin-input"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="teammate@example.com"
            required
          />
          <p className="admin-field-hint">
            Invite the user in Supabase Authentication first, then add them here.
          </p>
        </div>

        <div className="admin-form-field">
          <label htmlFor="team-role">Role</label>
          <select
            id="team-role"
            className="admin-input"
            name="role"
            defaultValue="viewer"
            required
          >
            {ADMIN_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message ? (
        <p className="admin-inline-success" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="admin-field-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="admin-form-actions">
        <button className="admin-button" type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add team member"}
        </button>
      </div>
    </form>
  );
}

export function TeamRoleForm({
  member,
  isSelf,
}: {
  member: AdminTeamMember;
  isSelf: boolean;
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
      const result = await updateTeamMemberRole(
        new FormData(event.currentTarget)
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage("Role saved.");
      router.refresh();
    } catch {
      setError("The role update failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-team-role" onSubmit={handleSubmit}>
      <input name="user_id" type="hidden" value={member.user_id} />
      <select
        className="admin-input"
        name="role"
        defaultValue={member.role}
        aria-label={`Role for ${member.email}`}
        disabled={pending}
      >
        {ADMIN_ROLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        className="admin-button admin-button-secondary"
        type="submit"
        disabled={pending || isSelf}
        title={isSelf ? "You cannot change your own role from this screen." : undefined}
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {message ? (
        <span className="admin-inline-success" role="status">
          {message}
        </span>
      ) : null}
      {error ? (
        <span className="admin-field-error" role="alert">
          {error}
        </span>
      ) : null}
    </form>
  );
}

export function RemoveTeamMemberButton({
  member,
  isSelf,
}: {
  member: AdminTeamMember;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    if (isSelf) {
      return;
    }

    if (
      !window.confirm(
        `Remove admin access for ${member.email}? Their Supabase login will remain, but they will no longer be able to open the admin.`
      )
    ) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("user_id", member.user_id);
      const result = await removeTeamMember(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    } catch {
      setError("The request failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-team-remove">
      <button
        className="admin-inline-button"
        type="button"
        onClick={handleRemove}
        disabled={pending || isSelf}
        title={isSelf ? "You cannot remove your own access." : undefined}
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {error ? (
        <span className="admin-field-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
