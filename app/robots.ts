import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/seo";

// Public pages are open to search engines and AI answer engines. The admin,
// auth callbacks, and APIs are not content.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/auth/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
