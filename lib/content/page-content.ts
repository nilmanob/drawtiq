import "server-only";

import { getPageSections } from "./cms";

/**
 * Deep-merges CMS content onto local fallback content. Arrays are replaced
 * wholesale so an editor can intentionally clear a list, while missing nested
 * fields keep their fallback values.
 */
function mergeContent(base: any, override: any): any {
  if (Array.isArray(base)) {
    return Array.isArray(override) ? override : base;
  }

  if (!base || typeof base !== "object") {
    return override ?? base;
  }

  if (!override || typeof override !== "object" || Array.isArray(override)) {
    return override ?? base;
  }

  const merged: Record<string, any> = { ...base };

  for (const [key, value] of Object.entries(override)) {
    merged[key] = key in base ? mergeContent(base[key], value) : value;
  }

  return merged;
}

/** Returns CMS content merged onto a local fallback so incomplete records are safe. */
export async function pageContent<T extends Record<string, any>>(
  pageKey: string,
  sectionKey: string,
  fallback: T
): Promise<T> {
  const { data } = await getPageSections(pageKey);
  const stored = data.find((section) => section.section_key === sectionKey)?.content;
  return stored && typeof stored === "object"
    ? (mergeContent(fallback, stored) as T)
    : fallback;
}

export type PageSeo = {
  title: string | null;
  description: string | null;
};

/**
 * Reads optional page-level SEO from page_sections. A dedicated `seo` section
 * wins; older rows with SEO filled on a content section remain supported.
 */
export async function getPageSeo(pageKey: string): Promise<PageSeo> {
  const { data } = await getPageSections(pageKey);
  const seoSection = data.find((section) => section.section_key === "seo");
  const title =
    seoSection?.seo_title?.trim() ||
    data.find((section) => section.seo_title?.trim())?.seo_title?.trim();
  const description =
    seoSection?.seo_description?.trim() ||
    data.find((section) => section.seo_description?.trim())?.seo_description?.trim();

  return {
    title: title || null,
    description: description || null,
  };
}
