import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams?: {
    next?: string;
    setup?: string;
  };
};

function safeNextPath(value: string | undefined) {
  if (
    !value ||
    value.startsWith("//") ||
    (value !== "/admin" && !value.startsWith("/admin/"))
  ) {
    return "/admin";
  }

  return value;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const configured = hasSupabaseEnv();

  if (configured) {
    const user = await getCurrentUser();
    if (user) {
      redirect("/admin");
    }
  }

  const nextPath = safeNextPath(searchParams?.next);
  const showSetup = !configured || searchParams?.setup === "1";

  return (
    <main className="admin-login">
      <section className="admin-card">
        <Link className="admin-back" href="/">
          ← Drawtiq
        </Link>

        <p className="admin-kicker">Drawtiq / Studio access</p>
        <h1>Sign in to the admin.</h1>
        <p>
          Use the email and password for the authorized studio admin account.
        </p>

        {showSetup ? (
          <div className="admin-setup">
            <strong>Supabase is not configured yet.</strong>
            <p>
              Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
              <code>.env.local</code>, run the database migration, then restart
              the dev server. The full setup steps are in the README.
            </p>
          </div>
        ) : (
          <LoginForm nextPath={nextPath} />
        )}

        <p className="admin-note">
          Authorized studio access only. Public pages are unchanged.
        </p>
      </section>
    </main>
  );
}
