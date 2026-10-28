"use client";

import { useState } from "react";
import { ForgotPasswordForm } from "./forgot-password-form";
import { LoginForm } from "./login-form";

type LoginPanelProps = {
  nextPath: string;
};

export function LoginPanel({ nextPath }: LoginPanelProps) {
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");

  if (mode === "forgot") {
    return (
      <div className="admin-auth-view">
        <h1>Reset your password.</h1>
        <p>
          Enter the email for your studio account and we&apos;ll send a secure
          password reset link.
        </p>
        <ForgotPasswordForm
          initialEmail={email}
          onBack={(nextEmail) => {
            setEmail(nextEmail ?? "");
            setMode("login");
          }}
        />
      </div>
    );
  }

  return (
    <div className="admin-auth-view">
      <h1>Sign in to the admin.</h1>
      <p>
        Use the email and password for your authorized studio account.
      </p>
      <LoginForm
        initialEmail={email}
        nextPath={nextPath}
        onForgotPassword={(nextEmail) => {
          setEmail(nextEmail);
          setMode("forgot");
        }}
      />
    </div>
  );
}
