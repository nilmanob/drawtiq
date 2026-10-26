"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // Even if the network call fails, clear the client-side route below.
    } finally {
      router.replace("/admin/login");
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="admin-button admin-button-secondary"
      onClick={handleSignOut}
      disabled={loading}
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
