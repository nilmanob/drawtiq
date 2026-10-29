import type { Metadata } from "next";
import Link from "next/link";
import { formatAdminDate, formatAdminDateTime } from "@/lib/admin/format";
import { listAdminAuditLog, listAdminTeam } from "@/lib/admin/data";
import type { AdminAuditEntry, AdminTeamMember } from "@/lib/admin/types";
import { getAdminSession } from "@/lib/auth";
import {
  ADMIN_PERMISSION_LABELS,
  ADMIN_ROLE_LABELS,
  ADMIN_ROLE_OPTIONS,
  ADMIN_ROLES,
  hasPermission,
  isAdminRole,
  type AdminPermission,
} from "@/lib/auth/roles";
import { hasSupabaseAdminAuth } from "@/lib/supabase/admin";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminPageHeader,
} from "../_components/admin-ui";
import {
  InviteTeamMemberForm,
  TeamMemberActions,
  TeamMemberName,
  TeamRoleForm,
} from "./team-forms";

export const metadata: Metadata = {
  title: "Team & access",
};

type TeamPageProps = {
  searchParams?: { q?: string; role?: string; status?: string };
};

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "pending", label: "Invitation pending" },
];

const INVITE_LABELS: Record<AdminTeamMember["invite_state"], string> = {
  pending: "Invitation pending",
  never_signed_in: "Password set, not signed in",
  accepted: "Accepted",
  unknown: "—",
};

const AUDIT_LABELS: Record<string, string> = {
  "member.added": "added to the team",
  "member.removed": "removed from the team",
  "role.changed": "role changed",
  "access.suspended": "access suspended",
  "access.restored": "access restored",
  "invite.sent": "invitation or setup link sent",
  "profile.updated": "profile updated",
};

const PERMISSIONS = Object.keys(ADMIN_PERMISSION_LABELS) as AdminPermission[];

function filterMembers(
  members: AdminTeamMember[],
  { q, role, status }: NonNullable<TeamPageProps["searchParams"]>
) {
  const query = q?.trim().toLowerCase() ?? "";

  return members.filter((member) => {
    if (
      query &&
      !member.email.toLowerCase().includes(query) &&
      !(member.display_name ?? "").toLowerCase().includes(query)
    ) {
      return false;
    }

    if (role && isAdminRole(role) && member.role !== role) {
      return false;
    }

    if (status === "pending") {
      return member.invite_state === "pending";
    }

    return !status || member.status === status;
  });
}

function describeAudit(entry: AdminAuditEntry) {
  const label = AUDIT_LABELS[entry.action] ?? entry.action;
  const details = entry.details ?? {};

  if (entry.action === "role.changed" && isAdminRole(details.from) && isAdminRole(details.to)) {
    return `${label}: ${ADMIN_ROLE_LABELS[details.from]} → ${ADMIN_ROLE_LABELS[details.to]}`;
  }

  if (entry.action === "member.added" && isAdminRole(details.role)) {
    return `${label} as ${ADMIN_ROLE_LABELS[details.role]}`;
  }

  return label;
}

export default async function AdminTeamPage({ searchParams = {} }: TeamPageProps) {
  const [result, session] = await Promise.all([
    listAdminTeam(),
    getAdminSession(),
  ]);
  const migrationApplied = result.ok && result.data.accessMigrationApplied;
  const audit = migrationApplied ? await listAdminAuditLog(20) : null;
  const canInvite = hasSupabaseAdminAuth();
  const currentUserId = session.admin?.user_id;
  const members = result.ok ? filterMembers(result.data.members, searchParams) : [];
  const total = result.ok ? result.data.members.length : 0;
  const filtered = Boolean(searchParams.q || searchParams.role || searchParams.status);

  return (
    <>
      <AdminPageHeader
        kicker="Team & access"
        title="Team members"
        description="Invite people to the admin, choose what they can do, and suspend or remove access. This is separate from the public About page team, which is edited under Content."
      />

      {result.ok && !migrationApplied ? (
        <div className="admin-alert admin-alert-error" role="status">
          <strong>Database update needed</strong>
          <p>
            Apply <code>20261028000400_admin_roles.sql</code> and{" "}
            <code>20261029000100_team_access.sql</code> to enable roles,
            suspension, invitation status, and the audit log. Until then every
            allowlisted user keeps full access.
          </p>
        </div>
      ) : null}

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Access / Invite</p>
            <h2>{canInvite ? "Invite a team member" : "Add a team member"}</h2>
          </div>
        </div>
        <InviteTeamMemberForm canInvite={canInvite} />
      </section>

      <form className="admin-team-filters" method="get" role="search">
        <input
          className="admin-input"
          type="search"
          name="q"
          placeholder="Search name or email"
          defaultValue={searchParams.q ?? ""}
          aria-label="Search team members"
        />
        <select
          className="admin-input"
          name="role"
          defaultValue={searchParams.role ?? ""}
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          {ADMIN_ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="admin-input"
          name="status"
          defaultValue={searchParams.status ?? ""}
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="admin-button admin-button-secondary" type="submit">
          Filter
        </button>
        {filtered ? (
          <Link className="admin-text-link" href="/admin/team">
            Clear
          </Link>
        ) : null}
      </form>

      {!result.ok ? (
        <AdminErrorState title="Team could not load" message={result.error} />
      ) : members.length === 0 ? (
        <AdminEmptyState
          title={filtered ? "No matching team members" : "No team members"}
          description={
            filtered
              ? `None of the ${total} team members match these filters.`
              : "Invite the first team member above."
          }
        />
      ) : (
        <div className="admin-table-wrap admin-team-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th>Invitation</th>
                <th>Last sign-in</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isSelf = member.user_id === currentUserId;

                return (
                  <tr key={member.user_id}>
                    <td>
                      <TeamMemberName
                        member={member}
                        isSelf={isSelf}
                        canEdit={migrationApplied}
                      />
                      <span className="admin-table-subtle">
                        Added {formatAdminDate(member.created_at)}
                      </span>
                    </td>
                    <td>
                      <TeamRoleForm member={member} isSelf={isSelf} />
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          member.status === "active"
                            ? "admin-badge-published"
                            : "admin-badge-archived"
                        }`}
                      >
                        {member.status === "active" ? "Active" : "Suspended"}
                      </span>
                      {member.status_changed_at ? (
                        <span className="admin-table-subtle">
                          since {formatAdminDate(member.status_changed_at)}
                        </span>
                      ) : null}
                    </td>
                    <td>
                      {INVITE_LABELS[member.invite_state]}
                      {member.invited_at ? (
                        <span className="admin-table-subtle">
                          Sent {formatAdminDate(member.invited_at)}
                          {member.invited_by_email
                            ? ` by ${member.invited_by_email}`
                            : ""}
                        </span>
                      ) : null}
                    </td>
                    <td>
                      {migrationApplied
                        ? member.last_sign_in_at
                          ? formatAdminDateTime(member.last_sign_in_at)
                          : "Never"
                        : "—"}
                    </td>
                    <td>
                      <TeamMemberActions
                        member={member}
                        isSelf={isSelf}
                        canInvite={canInvite}
                        migrationApplied={migrationApplied}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <section className="admin-team-roles" id="roles">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Access / Roles and permissions</p>
            <h2>What each role can do</h2>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table admin-permission-table">
            <thead>
              <tr>
                <th>Permission</th>
                {ADMIN_ROLES.map((role) => (
                  <th key={role}>{ADMIN_ROLE_LABELS[role]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>View dashboard, analytics, and inquiries</td>
                {ADMIN_ROLES.map((role) => (
                  <td key={role}>Yes</td>
                ))}
              </tr>
              {PERMISSIONS.map((permission) => (
                <tr key={permission}>
                  <td>{ADMIN_PERMISSION_LABELS[permission]}</td>
                  {ADMIN_ROLES.map((role) => (
                    <td key={role}>{hasPermission(role, permission) ? "Yes" : "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-team-role-grid">
          {ADMIN_ROLE_OPTIONS.map((role) => (
            <div className="admin-team-role-card" key={role.value}>
              <strong>{role.label}</strong>
              <p>{role.description}</p>
            </div>
          ))}
        </div>
      </section>

      {audit ? (
        <section className="admin-team-roles">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">Access / Activity</p>
              <h2>Recent team changes</h2>
            </div>
          </div>
          {!audit.ok ? (
            <p className="admin-field-error">{audit.error}</p>
          ) : audit.data.length === 0 ? (
            <p className="admin-field-hint">No team changes recorded yet.</p>
          ) : (
            <ul className="admin-cms-list">
              {audit.data.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.target_email ?? "Unknown user"}</strong>{" "}
                  {describeAudit(entry)}
                  <span className="admin-table-subtle">
                    {formatAdminDateTime(entry.created_at)} by{" "}
                    {entry.actor_email ?? "Supabase dashboard / system"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <p className="admin-field-hint">
        Roles are stored in the database and enforced by Row Level Security, so
        changes apply to the member&apos;s very next request. Nobody can change
        or suspend their own access, and at least one active Super Admin always
        remains.
      </p>
    </>
  );
}
