import type { Metadata } from "next";
import Link from "next/link";
import { hasSupabaseEnv } from "@/lib/env";
import { SetPasswordForm } from "./set-password-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set password",
};

export default function SetPasswordPage() {
  const configured = hasSupabaseEnv();

  return (
    <main className="admin-login">
      <section className="admin-card">
        <Link className="admin-back" href="/">
          ← Drawtiq
        </Link>

        <p className="admin-kicker">Drawtiq / Studio access</p>
        <h1>Set your password.</h1>
        <p>
          Choose a password for your studio admin account. Invitation and
          recovery links can only be used once.
        </p>

        {configured ? (
          <SetPasswordForm />
        ) : (
          <div className="admin-setup">
            <strong>Supabase is not configured yet.</strong>
            <p>
              Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
              <code>.env.local</code>, then restart the dev server.
            </p>
          </div>
        )}

        <p className="admin-note">
          Already set a password?{" "}
          <Link className="admin-text-link" href="/admin/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
