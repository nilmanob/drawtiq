import type { ReactNode } from "react";
import { requirePagePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TeamAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePagePermission("users:manage");
  return children;
}
