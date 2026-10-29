import type { Metadata } from "next";
import Link from "next/link";
import { hasSupabaseEnv } from "@/lib/env";
import { ForgotPasswordForm } from "../login/forgot-password-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset password",
};

/**
 * Standalone reset request page, linked from expired or invalid password
 * links. The sign-in page offers the same form inline.
 */
export default function ForgotPasswordPage() {
  const configured = hasSupabaseEnv();

  return (
    <main className="admin-login">
      <section className="admin-card">
        <Link className="admin-back" href="/">
          ← Drawtiq
        </Link>

        <p className="admin-kicker">Drawtiq / Studio access</p>

        <div className="admin-auth-view">
          <h1>Reset your password.</h1>
          <p>
            Enter the email for your studio account and we&apos;ll send a secure
            password reset link.
          </p>
          {configured ? (
            <ForgotPasswordForm />
          ) : (
            <div className="admin-setup">
              <strong>Supabase is not configured yet.</strong>
              <p>
                Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then restart the
                server.
              </p>
            </div>
          )}
        </div>

        <p className="admin-note">
          Authorized studio access only. Public pages are unchanged.
        </p>
      </section>
    </main>
  );
}
