import "server-only";

import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabasePublicClient } from "@/lib/supabase/public";
import { fallbackProjects, projectAliases } from "./fallback-projects";
import { fallbackPosts } from "./fallback-posts";
import {
  fallbackServiceDetails,
  fallbackServices,
} from "./fallback-services";
import type {
  ContentResult,
  ContentSource,
  PostBlock,
  PublicDeliverable,
  PublicFaq,
  PublicPost,
  PublicProject,
  PublicService,
  ServiceDetailFallback,
} from "./types";

type ContentMode = "auto" | "database" | "fallback";

type ProjectRow = {
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  discipline: string | null;
  industry: string | null;
  scope: string | null;
  summary: string | null;
  challenge: string | null;
  approach: string | null;
  solution: string | null;
  outcome: string | null;
  visual_key: string | null;
  gallery: unknown;
  featured: boolean | null;
  sort_order: number | null;
  seo_title: string | null;
  seo_description: string | null;
};

type ServiceRow = {
  slug: string;
  title: string;
  blurb: string | null;
  intro: string | null;
  icon: string | null;
  preview_path: string | null;
  tags: unknown;
  deliverables: unknown;
  faqs: unknown;
  sort_order: number | null;
  seo_title: string | null;
  seo_description: string | null;
};

type PostRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  read_time: string | null;
  visual: string | null;
  label: string | null;
  display: unknown;
  body: unknown;
  sort_order: number | null;
  published_at: string | null;
  created_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

const PROJECT_COLUMNS =
  "slug, title, subtitle, category, discipline, industry, scope, summary, challenge, approach, solution, outcome, visual_key, gallery, featured, sort_order, seo_title, seo_description";

const SERVICE_COLUMNS =
  "slug, title, blurb, intro, icon, preview_path, tags, deliverables, faqs, sort_order, seo_title, seo_description";

const POST_COLUMNS =
  "slug, title, excerpt, category, read_time, visual, label, display, body, sort_order, published_at, created_at, seo_title, seo_description";

const SERVICE_DETAIL_PATHS: Record<string, string> = {
  "service-ui-ux": "/service-ui-ux",
  "ui-ux-design": "/service-ui-ux",
  "digital-product-design": "/service-ui-ux",
  "service-graphic-design": "/service-graphic-design",
  "brand-identity": "/service-graphic-design",
  "graphic-design": "/service-graphic-design",
  "service-motion-design": "/service-motion-design",
  "motion-design": "/service-motion-design",
  "service-video-editing": "/service-video-editing",
  "video-editing": "/service-video-editing",
};

const POST_VISUALS = ["one", "two", "three", "four", "five"] as const;

function contentMode(): ContentMode {
  const configured = process.env.PUBLIC_CONTENT_SOURCE?.trim().toLowerCase();

  if (configured === "fallback" || configured === "static") {
    return "fallback";
  }

  if (configured === "database" || configured === "supabase") {
    return "database";
  }

  return "auto";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load content.";
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeDeliverables(value: unknown): PublicDeliverable[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item === "string") {
      const title = item.trim();
      return title ? [{ title, body: "" }] : [];
    }

    const record = asRecord(item);
    if (!record) {
      return [];
    }

    const title =
      asString(record.title) ?? asString(record.name) ?? asString(record.label);
    const body =
      asString(record.description) ??
      asString(record.body) ??
      asString(record.text) ??
      asString(record.detail) ??
      "";

    return title ? [{ title, body }] : [];
  });
}

function normalizeFaqs(value: unknown): PublicFaq[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const record = asRecord(item);
    if (!record) {
      return [];
    }

    const q = asString(record.question) ?? asString(record.q);
    const a = asString(record.answer) ?? asString(record.a);

    return q && a ? [{ q, a }] : [];
  });
}

function normalizeBlocks(value: unknown): PostBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const blocks: PostBlock[] = [];

  for (const item of value) {
    const record = asRecord(item);
    if (!record) {
      continue;
    }

    const type = asString(record.type);
    const text = asString(record.text);

    if (type === "p" && text) {
      blocks.push({ type: "p", text });
    } else if (type === "h2" && text) {
      blocks.push({ type: "h2", text });
    } else if (type === "quote" && text) {
      blocks.push({ type: "quote", text });
    } else if (type === "list") {
      const items = asStringArray(record.items);
      if (items.length) {
        blocks.push({ type: "list", items });
      }
    }
  }

  return blocks;
}

function normalizeDisplay(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  const record = asRecord(value);
  if (!record) {
    return "";
  }

  return (
    asString(record.html) ??
    asString(record.markup) ??
    asString(record.display) ??
    asString(record.text) ??
    ""
  );
}

function mapProject(row: ProjectRow): PublicProject {
  const fallback = fallbackProjects.find((item) => item.slug === row.slug);
  const configuredVisualKey = asString(row.visual_key);
  const visualKey =
    configuredVisualKey && configuredVisualKey !== "custom"
      ? configuredVisualKey
      : fallback?.visualKey ?? "custom";

  return {
    slug: row.slug,
    title: row.title || fallback?.title || "Untitled project",
    subtitle: asString(row.subtitle) ?? fallback?.subtitle ?? null,
    lead: asString(row.summary) ?? fallback?.lead ?? null,
    summary: asString(row.summary) ?? fallback?.summary ?? null,
    category: asString(row.category) ?? fallback?.category ?? null,
    discipline: asString(row.discipline) ?? fallback?.discipline ?? null,
    industry: asString(row.industry) ?? fallback?.industry ?? null,
    scope: asString(row.scope) ?? fallback?.scope ?? null,
    challenge: asString(row.challenge) ?? fallback?.challenge ?? null,
    approach: asString(row.approach) ?? fallback?.approach ?? null,
    solution: asString(row.solution) ?? fallback?.solution ?? null,
    outcome: asString(row.outcome) ?? fallback?.outcome ?? null,
    visualKey,
    featured: row.featured === true,
    sortOrder: asNumber(row.sort_order),
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    seoTitle: asString(row.seo_title) ?? fallback?.seoTitle ?? null,
    seoDescription:
      asString(row.seo_description) ?? fallback?.seoDescription ?? null,
    visual: visualKey === fallback?.visualKey ? fallback?.visual : undefined,
  };
}

function mapService(row: ServiceRow): PublicService {
  const fallback = fallbackServices.find((item) => item.slug === row.slug);
  const tags = asStringArray(row.tags);
  const deliverables = normalizeDeliverables(row.deliverables);
  const faqs = normalizeFaqs(row.faqs);

  return {
    slug: row.slug,
    title: row.title || fallback?.title || "Untitled service",
    blurb: asString(row.blurb) ?? fallback?.blurb ?? null,
    intro: asString(row.intro) ?? fallback?.intro ?? null,
    icon: asString(row.icon) ?? fallback?.icon ?? null,
    previewPath: asString(row.preview_path) ?? fallback?.previewPath ?? null,
    tags: tags.length ? tags : fallback?.tags ?? [],
    deliverables: deliverables.length
      ? deliverables
      : fallback?.deliverables ?? [],
    faqs: faqs.length ? faqs : fallback?.faqs ?? [],
    sortOrder: asNumber(row.sort_order),
    detailPath: SERVICE_DETAIL_PATHS[row.slug] ?? "/services",
    seoTitle: asString(row.seo_title) ?? fallback?.seoTitle ?? null,
    seoDescription:
      asString(row.seo_description) ?? fallback?.seoDescription ?? null,
  };
}

function mapPost(row: PostRow): PublicPost {
  const fallback = fallbackPosts.find((item) => item.slug === row.slug);
  const visual = POST_VISUALS.includes(
    row.visual as (typeof POST_VISUALS)[number]
  )
    ? (row.visual as PublicPost["visual"])
    : fallback?.visual ?? "one";
  const display = normalizeDisplay(row.display) || fallback?.display || "";
  const body = normalizeBlocks(row.body);
  const date =
    asString(row.published_at) ?? asString(row.created_at) ?? fallback?.date ?? "";

  return {
    slug: row.slug,
    title: row.title || fallback?.title || "Untitled note",
    excerpt: asString(row.excerpt) ?? fallback?.excerpt ?? "",
    category: asString(row.category) ?? fallback?.category ?? "Insights",
    readTime: asString(row.read_time) ?? fallback?.readTime ?? "",
    date,
    visual,
    label: asString(row.label) ?? fallback?.label ?? "",
    display,
    body: body.length ? body : fallback?.body ?? [],
    sortOrder: asNumber(row.sort_order),
    seoTitle: asString(row.seo_title) ?? null,
    seoDescription: asString(row.seo_description) ?? null,
  };
}

function fallbackPostList(): PublicPost[] {
  return fallbackPosts.map((post, index) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    readTime: post.readTime,
    date: post.date,
    visual: post.visual,
    label: post.label,
    display: post.display,
    body: post.body,
    sortOrder: index + 1,
    seoTitle: null,
    seoDescription: null,
  }));
}

function emptyResult<T>(data: T, source: ContentSource, error: string | null = null): ContentResult<T> {
  return { data, source, error };
}

/**
 * Public content fetchers.
 *
 * In auto mode, the database is used as soon as it has at least one published
 * record. Otherwise the original hardcoded content is returned so the site
 * keeps working before Supabase has been configured or seeded. Set
 * PUBLIC_CONTENT_SOURCE to "fallback" or "database" to force either side while
 * content is being verified.
 */

export const getPublishedProjects = cache(
  async (): Promise<ContentResult<PublicProject[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult(fallbackProjects, "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("projects")
        .select(PROJECT_COLUMNS)
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false, nullsFirst: false });

      if (error) {
        throw new Error(error.message);
      }

      const projects = ((data ?? []) as ProjectRow[])
        .map(mapProject)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      if (projects.length === 0 && mode === "auto") {
        return emptyResult(fallbackProjects, "fallback");
      }

      return emptyResult(projects, "database");
    } catch (error) {
      return emptyResult(fallbackProjects, "fallback", errorMessage(error));
    }
  }
);

export const getPublishedProject = cache(
  async (slug: string): Promise<ContentResult<PublicProject | null>> => {
    const collection = await getPublishedProjects();
    const canonicalSlug = projectAliases[slug] ?? slug;
    const project =
      collection.data.find((item) => item.slug === canonicalSlug) ?? null;

    return {
      data: project,
      source: collection.source,
      error: collection.error,
    };
  }
);

export const getPublishedServices = cache(
  async (): Promise<ContentResult<PublicService[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult(fallbackServices, "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("services")
        .select(SERVICE_COLUMNS)
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false, nullsFirst: false });

      if (error) {
        throw new Error(error.message);
      }

      const services = ((data ?? []) as ServiceRow[])
        .map(mapService)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      if (services.length === 0 && mode === "auto") {
        return emptyResult(fallbackServices, "fallback");
      }

      return emptyResult(services, "database");
    } catch (error) {
      return emptyResult(fallbackServices, "fallback", errorMessage(error));
    }
  }
);

export const getPublishedServiceDetail = cache(
  async (
    routeSlug: string
  ): Promise<ContentResult<ServiceDetailFallback | null>> => {
    const fallbackDetail =
      fallbackServiceDetails.find((detail) => detail.routeSlug === routeSlug) ??
      null;

    if (!fallbackDetail) {
      return emptyResult(null, "fallback");
    }

    const collection = await getPublishedServices();

    if (collection.source === "fallback") {
      return {
        data: fallbackDetail,
        source: "fallback",
        error: collection.error,
      };
    }

    const service =
      collection.data.find((item) =>
        fallbackDetail.serviceSlugs.includes(item.slug)
      ) ?? null;

    if (!service) {
      return {
        data: null,
        source: "database",
        error: collection.error,
      };
    }

    return {
      data: {
        ...fallbackDetail,
        heroTitle: service.blurb || fallbackDetail.heroTitle,
        lead: service.intro || fallbackDetail.lead,
        deliverables: service.deliverables.length
          ? service.deliverables
          : fallbackDetail.deliverables,
        faqs: service.faqs.length ? service.faqs : fallbackDetail.faqs,
        seoTitle: service.seoTitle || fallbackDetail.seoTitle,
        seoDescription:
          service.seoDescription || fallbackDetail.seoDescription,
      },
      source: "database",
      error: collection.error,
    };
  }
);

export const getPublishedPosts = cache(
  async (): Promise<ContentResult<PublicPost[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult(fallbackPostList(), "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("blog_posts")
        .select(POST_COLUMNS)
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false, nullsFirst: false });

      if (error) {
        throw new Error(error.message);
      }

      const posts = ((data ?? []) as PostRow[])
        .map(mapPost)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      if (posts.length === 0 && mode === "auto") {
        return emptyResult(fallbackPostList(), "fallback");
      }

      return emptyResult(posts, "database");
    } catch (error) {
      return emptyResult(fallbackPostList(), "fallback", errorMessage(error));
    }
  }
);

export const getPublishedPost = cache(
  async (slug: string): Promise<ContentResult<PublicPost | null>> => {
    const collection = await getPublishedPosts();
    const post = collection.data.find((item) => item.slug === slug) ?? null;

    return {
      data: post,
      source: collection.source,
      error: collection.error,
    };
  }
);
