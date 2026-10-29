import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { ADMIN_ROLE_LABELS } from "@/lib/auth/roles";
import { AdminNav } from "./_components/admin-nav";
import { SignOutButton } from "./sign-out-button";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAdminSession();

  if (!session.configured) {
    redirect("/admin/login?setup=1");
  }

  if (!session.user) {
    redirect("/admin/login");
  }

  if (!session.admin) {
    return (
      <main className="admin-shell admin-shell-narrow">
        <div className="admin-card">
          <p className="admin-kicker">Drawtiq / Admin</p>
          {session.suspended ? (
            <>
              <h1>Access suspended.</h1>
              <p>
                Your admin access has been suspended by a Super Admin. Your
                login still works, but you cannot open the admin until your
                access is restored.
              </p>
            </>
          ) : (
            <>
              <h1>Access denied.</h1>
              <p>
                The signed-in account is not on the studio team. Sign in with
                an authorized account or ask a Super Admin to invite you from
                the Team screen.
              </p>
            </>
          )}
          <p className="admin-user">{session.user.email}</p>
          <div className="admin-denied">
            <SignOutButton />
            <Link className="admin-link" href="/">
              Return to the public site
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link href="/admin" className="admin-brand-mark">
            Drawtiq<span>.</span>
          </Link>
          <p className="admin-brand-label">Studio admin</p>
        </div>

        <Suspense fallback={<nav className="admin-nav" aria-label="Admin navigation" />}>
          <AdminNav role={session.admin.role} />
        </Suspense>

        <div className="admin-sidebar-footer">
          <Link className="admin-link" href="/">
            View public site ↗
          </Link>
          <SignOutButton />
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">Signed in as</p>
            <p className="admin-user">
              <Link className="admin-user-link" href="/admin/account">
                {session.admin.display_name || session.user.email}
              </Link>
              <span className="admin-role-badge">
                {ADMIN_ROLE_LABELS[session.admin.role]}
              </span>
            </p>
          </div>
          <div className="admin-header-actions">
            <Link className="admin-link" href="/">
              Public site ↗
            </Link>
            <SignOutButton />
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
