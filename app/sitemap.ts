import type { MetadataRoute } from "next";
import { getPublishedPosts, getPublishedProjects } from "@/lib/content/data";
import { absoluteUrl } from "@/lib/seo";

// Rebuilt with the public content cache, so new posts and case studies appear
// without a redeploy.
export const revalidate = 3600;

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/work", priority: 0.9, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/service-ui-ux", priority: 0.8, changeFrequency: "monthly" },
  { path: "/service-graphic-design", priority: 0.8, changeFrequency: "monthly" },
  { path: "/service-motion-design", priority: 0.8, changeFrequency: "monthly" },
  { path: "/service-video-editing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/insights", priority: 0.7, changeFrequency: "weekly" },
  { path: "/careers", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: projects }, { data: posts }] = await Promise.all([
    getPublishedProjects(),
    getPublishedPosts(),
  ]);

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...(projects ?? []).map((project) => ({
      url: absoluteUrl(`/case-study/${project.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...(posts ?? []).map((post) => ({
      url: absoluteUrl(`/insights/${post.slug}`),
      lastModified: post.date ? new Date(post.date) : undefined,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
