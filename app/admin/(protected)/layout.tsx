import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
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
          <h1>Access denied.</h1>
          <p>
            The signed-in account is not on the studio admin allowlist. Sign in
            with the authorized admin account or ask the site owner to add this
            user ID to <code>public.admin_users</code>.
          </p>
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

        <AdminNav />

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
            <p className="admin-user">{session.user.email}</p>
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
