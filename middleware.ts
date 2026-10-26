import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only admin routes need auth. This keeps public pages on the same fast,
  // static path and avoids running Supabase session refreshes site-wide.
  matcher: ["/admin", "/admin/:path*"],
};
