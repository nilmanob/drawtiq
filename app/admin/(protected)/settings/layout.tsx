import type { ReactNode } from "react";
import { requirePagePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePagePermission("settings:write");
  return children;
}
