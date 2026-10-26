import type { ReactNode } from "react";

/**
 * The case study page now renders its content from Supabase (with the original
 * hardcoded content as a fallback). Layout only needs to pass children through;
 * the old client-side script would overwrite server-rendered database content.
 */
export default function CaseStudyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
