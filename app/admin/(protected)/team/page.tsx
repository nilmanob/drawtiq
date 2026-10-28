import type { Metadata } from "next";
import { formatAdminDate } from "@/lib/admin/format";
import { listAdminTeam } from "@/lib/admin/data";
import { getAdminSession } from "@/lib/auth";
import { ADMIN_ROLE_OPTIONS } from "@/lib/auth/roles";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminPageHeader,
} from "../_components/admin-ui";
import {
  AddTeamMemberForm,
  RemoveTeamMemberButton,
  TeamRoleForm,
} from "./team-forms";

export const metadata: Metadata = {
  title: "Team",
};

export default async function AdminTeamPage() {
  const [result, session] = await Promise.all([
    listAdminTeam(),
    getAdminSession(),
  ]);
  const currentUserId = session.admin?.user_id;

  return (
    <>
      <AdminPageHeader
        kicker="Account / Team"
        title="Team & roles"
        description="Control who can open the admin and what they can do. New team members are never administrators by default."
      />

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Access / Add member</p>
            <h2>Add an existing auth user</h2>
          </div>
        </div>
        <AddTeamMemberForm />
      </section>

      {!result.ok ? (
        <AdminErrorState title="Team could not load" message={result.error} />
      ) : result.data.length === 0 ? (
        <AdminEmptyState
          title="No team members"
          description="Invite the first user in Supabase Authentication, then add their email above."
        />
      ) : (
        <div className="admin-table-wrap admin-team-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Added</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {result.data.map((member) => {
                const isSelf = member.user_id === currentUserId;

                return (
                  <tr key={member.user_id}>
                    <td>
                      <strong>{member.email}</strong>
                      {isSelf ? (
                        <span className="admin-role-badge">You</span>
                      ) : null}
                    </td>
                    <td>
                      <TeamRoleForm member={member} isSelf={isSelf} />
                    </td>
                    <td>{formatAdminDate(member.created_at)}</td>
                    <td>
                      <RemoveTeamMemberButton member={member} isSelf={isSelf} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <section className="admin-team-roles">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Access / Role guide</p>
            <h2>What each role can do</h2>
          </div>
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

      <p className="admin-field-hint">
        Invite users from Supabase Authentication first. Removing a team member
        only removes admin access; their Supabase login stays intact. Changes
        take effect the next time the user opens or refreshes the admin.
      </p>
    </>
  );
}
