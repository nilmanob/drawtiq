import type { ReactNode } from "react";
import { requirePagePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ServicesAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePagePermission("content:write");
  return children;
}
