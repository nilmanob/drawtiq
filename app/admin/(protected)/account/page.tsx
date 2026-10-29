import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import {
  ADMIN_PERMISSION_LABELS,
  ADMIN_ROLE_DESCRIPTIONS,
  ADMIN_ROLE_LABELS,
  hasPermission,
  type AdminPermission,
} from "@/lib/auth/roles";
import { AdminPageHeader } from "../_components/admin-ui";
import { ChangePasswordForm } from "./change-password-form";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "My account",
};

const PERMISSIONS = Object.keys(ADMIN_PERMISSION_LABELS) as AdminPermission[];

export default async function AdminAccountPage() {
  const session = await getAdminSession();

  // The protected layout already handles signed-out and non-team users.
  if (!session.user || !session.admin || !session.user.email) {
    redirect("/admin");
  }

  const { admin } = session;
  const email = session.user.email;

  return (
    <>
      <AdminPageHeader
        kicker="Team & access / My account"
        title="My account"
        description="Update your name and password. Roles and access are managed by Super Admins on the Team screen."
      />

      <div className="admin-account-grid">
        <section className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">Account / Profile</p>
              <h2>{email}</h2>
            </div>
            <span className="admin-role-badge">{ADMIN_ROLE_LABELS[admin.role]}</span>
          </div>
          <ProfileForm userId={admin.user_id} displayName={admin.display_name} />
          <div className="admin-account-role">
            <p className="admin-field-hint">{ADMIN_ROLE_DESCRIPTIONS[admin.role]}</p>
            <ul className="admin-checklist">
              {PERMISSIONS.filter((permission) => hasPermission(admin.role, permission)).map(
                (permission) => (
                  <li key={permission}>{ADMIN_PERMISSION_LABELS[permission]}</li>
                )
              )}
            </ul>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">Account / Security</p>
              <h2>Change password</h2>
            </div>
          </div>
          <ChangePasswordForm email={email} />
        </section>
      </div>
    </>
  );
}
