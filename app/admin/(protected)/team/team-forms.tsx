"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_ROLE_LABELS, ADMIN_ROLE_OPTIONS } from "@/lib/auth/roles";
import type { AdminTeamMember } from "@/lib/admin/types";
import {
  inviteTeamMember,
  removeTeamMember,
  resendTeamInvite,
  setTeamMemberStatus,
  updateTeamMemberProfile,
  updateTeamMemberRole,
  type TeamActionResult,
} from "./actions";

const INVITE_ROLE_OPTIONS = ADMIN_ROLE_OPTIONS.filter(
  (option) => option.value !== "owner"
);

type Feedback = { kind: "success" | "error"; text: string } | null;

/** Runs a team server action and refreshes the list on success. */
function useTeamAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function run(
    action: (formData: FormData) => Promise<TeamActionResult>,
    formData: FormData
  ) {
    setPending(true);
    setFeedback(null);
    setFieldErrors({});

    try {
      const result = await action(formData);

      if (!result.ok) {
        setFeedback({ kind: "error", text: result.error });
        setFieldErrors(result.fieldErrors ?? {});
        return false;
      }

      setFeedback({ kind: "success", text: result.message });
      router.refresh();
      return true;
    } catch {
      setFeedback({
        kind: "error",
        text: "The request failed. Check your connection and try again.",
      });
      return false;
    } finally {
      setPending(false);
    }
  }

  return { pending, feedback, fieldErrors, run };
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  if (!feedback) {
    return null;
  }

  return feedback.kind === "success" ? (
    <p className="admin-inline-success" role="status">
      {feedback.text}
    </p>
  ) : (
    <p className="admin-field-error" role="alert">
      {feedback.text}
    </p>
  );
}

function memberFormData(member: AdminTeamMember, extra: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("user_id", member.user_id);
  Object.entries(extra).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

export function InviteTeamMemberForm({ canInvite }: { canInvite: boolean }) {
  const { pending, feedback, fieldErrors, run } = useTeamAction();
  const [role, setRole] = useState("viewer");
  const selected = INVITE_ROLE_OPTIONS.find((option) => option.value === role);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (await run(inviteTeamMember, formData)) {
      form.reset();
      setRole("viewer");
    }
  }

  return (
    <form className="admin-team-add" onSubmit={handleSubmit} noValidate>
      <div className="admin-form-grid">
        <div className="admin-form-field">
          <label htmlFor="team-email">Email</label>
          <input
            id="team-email"
            className="admin-input"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="teammate@example.com"
            required
            aria-invalid={fieldErrors.email ? true : undefined}
          />
          {fieldErrors.email ? (
            <p className="admin-field-error">{fieldErrors.email[0]}</p>
          ) : null}
        </div>

        <div className="admin-form-field">
          <label htmlFor="team-name">Name (optional)</label>
          <input
            id="team-name"
            className="admin-input"
            name="display_name"
            type="text"
            maxLength={120}
            autoComplete="off"
          />
          {fieldErrors.display_name ? (
            <p className="admin-field-error">{fieldErrors.display_name[0]}</p>
          ) : null}
        </div>

        <div className="admin-form-field is-full">
          <label htmlFor="team-role">Role</label>
          <select
            id="team-role"
            className="admin-input"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            required
          >
            {INVITE_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.role ? (
            <p className="admin-field-error">{fieldErrors.role[0]}</p>
          ) : null}
          {selected ? (
            <p className="admin-field-hint">{selected.description}</p>
          ) : null}
        </div>
      </div>

      <FeedbackMessage feedback={feedback} />

      <div className="admin-form-actions">
        <button className="admin-button" type="submit" disabled={pending}>
          {pending
            ? canInvite
              ? "Sending invitation…"
              : "Adding…"
            : canInvite
              ? "Invite to team"
              : "Add existing user"}
        </button>
        <p className="admin-field-hint">
          {canInvite
            ? "If the email already has a Supabase login it is added straight away; otherwise they get an email with a secure link to set their password. To make someone a Super Admin, invite them first, then change their role in the list."
            : "Email invitations are off until SUPABASE_SERVICE_ROLE_KEY is set on the server. Until then, only emails that already have a Supabase login can be added."}
        </p>
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
  const { pending, feedback, run } = useTeamAction();
  const [role, setRole] = useState<string>(member.role);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (role === member.role) {
      return;
    }

    const nextLabel = ADMIN_ROLE_LABELS[role as AdminTeamMember["role"]];
    if (
      !window.confirm(
        `Change ${member.email} from ${ADMIN_ROLE_LABELS[member.role]} to ${nextLabel}? This takes effect immediately.`
      )
    ) {
      setRole(member.role);
      return;
    }

    await run(updateTeamMemberRole, memberFormData(member, { role }));
  }

  if (isSelf) {
    return (
      <span className="admin-role-badge" title="Ask another Super Admin to change your role.">
        {ADMIN_ROLE_LABELS[member.role]}
      </span>
    );
  }

  return (
    <form className="admin-team-role" onSubmit={handleSubmit}>
      <select
        className="admin-input"
        name="role"
        value={role}
        onChange={(event) => setRole(event.target.value)}
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
        disabled={pending || role === member.role}
      >
        {pending ? "Saving…" : "Save"}
      </button>
      <FeedbackMessage feedback={feedback} />
    </form>
  );
}

export function TeamMemberName({
  member,
  isSelf,
  canEdit,
}: {
  member: AdminTeamMember;
  isSelf: boolean;
  canEdit: boolean;
}) {
  const { pending, feedback, run } = useTeamAction();
  const [editing, setEditing] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("display_name") ?? "");
    if (
      await run(
        updateTeamMemberProfile,
        memberFormData(member, { display_name: name })
      )
    ) {
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <form className="admin-team-name-form" onSubmit={handleSubmit}>
        <input
          className="admin-input"
          name="display_name"
          defaultValue={member.display_name ?? ""}
          maxLength={120}
          aria-label={`Name for ${member.email}`}
          autoFocus
        />
        <button className="admin-inline-button" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          className="admin-inline-button"
          type="button"
          onClick={() => setEditing(false)}
          disabled={pending}
        >
          Cancel
        </button>
        <FeedbackMessage feedback={feedback} />
      </form>
    );
  }

  return (
    <div className="admin-team-member">
      <strong>{member.display_name || member.email}</strong>
      {isSelf ? <span className="admin-role-badge">You</span> : null}
      {member.display_name ? <span>{member.email}</span> : null}
      {canEdit ? (
        <button
          className="admin-team-edit"
          type="button"
          onClick={() => setEditing(true)}
        >
          Edit name
        </button>
      ) : null}
      {feedback?.kind === "success" ? <FeedbackMessage feedback={feedback} /> : null}
    </div>
  );
}

export function TeamMemberActions({
  member,
  isSelf,
  canInvite,
  migrationApplied,
}: {
  member: AdminTeamMember;
  isSelf: boolean;
  canInvite: boolean;
  migrationApplied: boolean;
}) {
  const { pending, feedback, run } = useTeamAction();

  if (isSelf) {
    return <span className="admin-table-subtle">Your account</span>;
  }

  const suspended = member.status === "suspended";
  const pendingInvite = member.invite_state === "pending";

  async function resend() {
    if (
      window.confirm(
        pendingInvite
          ? `Re-send the invitation email to ${member.email}?`
          : `Send ${member.email} a link to set a new password?`
      )
    ) {
      await run(resendTeamInvite, memberFormData(member));
    }
  }

  async function toggleStatus() {
    const message = suspended
      ? `Restore admin access for ${member.email}?`
      : `Suspend admin access for ${member.email}? They are locked out of the admin immediately, but their row, role, and history are kept so you can restore them.`;

    if (window.confirm(message)) {
      await run(
        setTeamMemberStatus,
        memberFormData(member, { status: suspended ? "active" : "suspended" })
      );
    }
  }

  async function remove() {
    if (
      window.confirm(
        `Remove ${member.email} from the team? Their admin access ends now. Their Supabase login, the content they created, and the audit history are kept. Suspending is reversible; removing means inviting them again later.`
      )
    ) {
      await run(removeTeamMember, memberFormData(member));
    }
  }

  return (
    <div className="admin-team-actions">
      {migrationApplied && !suspended && (canInvite || !pendingInvite) ? (
        <button className="admin-inline-button" type="button" onClick={resend} disabled={pending}>
          {pendingInvite ? "Resend invite" : "Send setup link"}
        </button>
      ) : null}
      {migrationApplied ? (
        <button className="admin-inline-button" type="button" onClick={toggleStatus} disabled={pending}>
          {suspended ? "Restore access" : "Suspend"}
        </button>
      ) : null}
      <button
        className="admin-inline-button admin-inline-button-danger"
        type="button"
        onClick={remove}
        disabled={pending}
      >
        Remove
      </button>
      <FeedbackMessage feedback={feedback} />
    </div>
  );
}
