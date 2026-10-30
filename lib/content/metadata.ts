import "server-only";

import type { Metadata } from "next";
import { getPublishedServiceDetail } from "./data";
import { getPageSeo } from "./page-content";
import { pageSeo } from "@/lib/seo";

/** Per-service metadata with page_sections SEO as a shared fallback. */
export async function serviceDetailMetadata(routeSlug: string): Promise<Metadata> {
  const [{ data }, seo] = await Promise.all([
    getPublishedServiceDetail(routeSlug),
    getPageSeo("service-details"),
  ]);

  if (!data) {
    return { title: "Service not found" };
  }

  return pageSeo({
    title: data.seoTitle || seo.title || `${data.heroTitle} — Drawtiq`,
    description: data.seoDescription || seo.description || data.lead || undefined,
    alternates: { canonical: `/${routeSlug}` },
  });
}
