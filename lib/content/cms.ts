import "server-only";

import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabasePublicClient } from "@/lib/supabase/public";
import type { ContentResult, ContentSource } from "./types";

type ContentMode = "auto" | "database" | "fallback";

// Preferred singleton rows. Legacy imports created duplicate global_settings
// rows; selecting the canonical row first keeps reads deterministic without
// deleting or constraining data.
const GLOBAL_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";
const CONTACT_SETTINGS_ID = "00000000-0000-0000-0000-000000000002";

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

// Old studio addresses still stored in some CMS rows. Every public CMS read is
// rewritten to the current address, so the site is correct even before the
// 20261030000300_contact_email.sql cleanup has been applied.
const LEGACY_EMAIL = /\b(?:hello|careers)@drawtiq\.studio\b/gi;
const CONTACT_EMAIL = "contact@drawtiq.com";

function replaceLegacyEmails<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(LEGACY_EMAIL, CONTACT_EMAIL) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceLegacyEmails(item)) as T;
  }
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceLegacyEmails(item)])
    ) as T;
  }
  return value;
}

function emptyResult<T>(data: T, source: ContentSource, error: string | null = null): ContentResult<T> {
  return { data: source === "database" ? replaceLegacyEmails(data) : data, source, error };
}

/**
 * CMS content fetchers for the new database-managed tables.
 *
 * All follow the same pattern as lib/content/data.ts:
 * - auto mode: uses Supabase when it has visible rows, otherwise falls back
 * - database mode: always uses Supabase
 * - fallback mode: always uses the original hardcoded content
 *
 * Draft content is never returned to the public (RLS also enforces this).
 */

export type NavItem = {
  id: string;
  label: string;
  href: string;
  order_index: number;
  is_visible: boolean;
  is_external: boolean;
};

export type FooterLink = {
  id: string;
  label: string;
  href: string;
  order_index: number;
  is_visible: boolean;
};

export type FooterSocial = {
  id: string;
  label: string;
  href: string;
  order_index: number;
  is_visible: boolean;
};

export type HomepageSection = {
  id: string;
  section_key: string;
  section_type: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown>;
  order_index: number;
  is_visible: boolean;
};

export type Testimonial = {
  id: string;
  quote: string;
  emphasis: string | null;
  number: string | null;
  label: string | null;
  order_index: number;
  is_visible: boolean;
};

export type TeamMember = {
  id: string;
  role: string;
  discipline: string | null;
  order_index: number;
  is_visible: boolean;
};

export type AboutValue = {
  id: string;
  index_label: string;
  title: string;
  body: string;
  order_index: number;
  is_visible: boolean;
};

export type AboutSection = {
  id: string;
  section_key: string;
  title: string | null;
  content: Record<string, unknown>;
  order_index: number;
  is_visible: boolean;
};

export type CareersRole = {
  id: string;
  title: string;
  meta: string | null;
  body: string;
  order_index: number;
  is_visible: boolean;
};

export type CareersPerk = {
  id: string;
  number: string;
  title: string;
  body: string;
  order_index: number;
  is_visible: boolean;
};

export type CareersProcessStep = {
  id: string;
  number: string;
  title: string;
  body: string;
  order_index: number;
  is_visible: boolean;
};

export type CareersFaq = {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  is_visible: boolean;
};

export type PricingPlan = {
  id: string;
  name: string;
  tagline: string | null;
  monthly_price: number;
  quarterly_price: number;
  cta_label: string | null;
  is_featured: boolean;
  order_index: number;
  is_visible: boolean;
};

export type PricingPlanFeature = {
  id: string;
  plan_id: string;
  feature_text: string;
  order_index: number;
};

export type PricingAddon = {
  id: string;
  title: string;
  price: string;
  note: string | null;
  order_index: number;
  is_visible: boolean;
};

export type PricingFaq = {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  is_visible: boolean;
};

export type PricingIncludedFeature = {
  id: string;
  feature_text: string;
  order_index: number;
  is_visible: boolean;
};

export type PricingEngagementModel = {
  id: string;
  number: string;
  title: string;
  body: string;
  order_index: number;
  is_visible: boolean;
};

export type GlobalSettings = {
  id: string;
  site_name: string;
  site_tagline: string | null;
  logo_path: string | null;
  footer_logo_path: string | null;
  contact_email: string | null;
  careers_email: string | null;
  footer_tagline: string | null;
  footer_bottom_text: string | null;
  copyright_holder: string | null;
  social_links: unknown[];
  seo_title: string | null;
  seo_description: string | null;
};

export type ContactSettings = {
  id: string;
  hero_eyebrow: string | null;
  hero_heading: string | null;
  hero_lead: string | null;
  copy_eyebrow: string | null;
  copy_heading: string | null;
  copy_paragraph: string | null;
  email_label: string | null;
  email_address: string | null;
  form_heading: string | null;
  form_subheading: string | null;
  submit_label: string | null;
  hint_text: string | null;
};

export type ContactFormField = {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  placeholder: string | null;
  options: unknown[];
  order_index: number;
  is_visible: boolean;
};

export type PageSection = {
  id: string;
  page_key: string;
  section_key: string;
  content: Record<string, unknown>;
  order_index: number;
  is_visible: boolean;
  seo_title: string | null;
  seo_description: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Global settings (singleton)
// ─────────────────────────────────────────────────────────────────────────────

export const getGlobalSettings = cache(
  async (): Promise<ContentResult<GlobalSettings | null>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult(null, "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data: canonical, error: canonicalError } = await client
        .from("global_settings")
        .select("*")
        .eq("id", GLOBAL_SETTINGS_ID)
        .maybeSingle();

      if (canonicalError) {
        throw new Error(canonicalError.message);
      }

      if (canonical) {
        return emptyResult(canonical as GlobalSettings, "database");
      }

      // Fallback for projects that do not have the canonical row: always pick
      // the lowest id rather than relying on physical table order.
      const { data, error } = await client
        .from("global_settings")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? null) as GlobalSettings | null, "database");
    } catch (error) {
      return emptyResult(null, "fallback", errorMessage(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────────────────────

export const getNavItems = cache(
  async (): Promise<ContentResult<NavItem[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("nav_items")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as NavItem[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────────

export const getFooterLinks = cache(
  async (): Promise<ContentResult<FooterLink[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("footer_links")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as FooterLink[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

export const getFooterSocial = cache(
  async (): Promise<ContentResult<FooterSocial[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("footer_social")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as FooterSocial[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Homepage sections
// ─────────────────────────────────────────────────────────────────────────────

export const getHomepageSections = cache(
  async (): Promise<ContentResult<HomepageSection[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("homepage_sections")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as HomepageSection[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

export const getPageSections = cache(
  async (pageKey: string): Promise<ContentResult<PageSection[]>> => {
    const mode = contentMode();
    if (mode === "fallback" || !hasSupabaseEnv()) return emptyResult([], "fallback");
    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client.from("page_sections").select("*")
        .eq("page_key", pageKey).eq("is_visible", true).order("order_index");
      if (error) throw new Error(error.message);
      return emptyResult((data ?? []) as PageSection[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Testimonials
// ─────────────────────────────────────────────────────────────────────────────

export const getTestimonials = cache(
  async (): Promise<ContentResult<Testimonial[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("testimonials")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as Testimonial[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Team members
// ─────────────────────────────────────────────────────────────────────────────

export const getTeamMembers = cache(
  async (): Promise<ContentResult<TeamMember[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("team_members")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as TeamMember[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// About values
// ─────────────────────────────────────────────────────────────────────────────

export const getAboutValues = cache(
  async (): Promise<ContentResult<AboutValue[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("about_values")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as AboutValue[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// About sections
// ─────────────────────────────────────────────────────────────────────────────

export const getAboutSections = cache(
  async (): Promise<ContentResult<AboutSection[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("about_sections")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as AboutSection[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Careers
// ─────────────────────────────────────────────────────────────────────────────

export const getCareersRoles = cache(
  async (): Promise<ContentResult<CareersRole[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("careers_roles")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as CareersRole[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

export const getCareersPerks = cache(
  async (): Promise<ContentResult<CareersPerk[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("careers_perks")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as CareersPerk[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

export const getCareersProcess = cache(
  async (): Promise<ContentResult<CareersProcessStep[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("careers_process")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as CareersProcessStep[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

export const getCareersFaqs = cache(
  async (): Promise<ContentResult<CareersFaq[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("careers_faqs")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as CareersFaq[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Pricing
// ─────────────────────────────────────────────────────────────────────────────

export const getPricingPlans = cache(
  async (): Promise<ContentResult<PricingPlan[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("pricing_plans")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as PricingPlan[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

export const getPricingPlanFeatures = cache(
  async (): Promise<ContentResult<PricingPlanFeature[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("pricing_plan_features")
        .select("*")
        .order("plan_id", { ascending: true })
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as PricingPlanFeature[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

export const getPricingAddons = cache(
  async (): Promise<ContentResult<PricingAddon[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("pricing_addons")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as PricingAddon[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

export const getPricingFaqs = cache(
  async (): Promise<ContentResult<PricingFaq[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("pricing_faqs")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as PricingFaq[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

export const getPricingIncludedFeatures = cache(
  async (): Promise<ContentResult<PricingIncludedFeature[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("pricing_included_features")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as PricingIncludedFeature[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

export const getPricingEngagementModels = cache(
  async (): Promise<ContentResult<PricingEngagementModel[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("pricing_engagement_models")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as PricingEngagementModel[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Contact
// ─────────────────────────────────────────────────────────────────────────────

export const getContactSettings = cache(
  async (): Promise<ContentResult<ContactSettings | null>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult(null, "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data: canonical, error: canonicalError } = await client
        .from("contact_settings")
        .select("*")
        .eq("id", CONTACT_SETTINGS_ID)
        .maybeSingle();

      if (canonicalError) {
        throw new Error(canonicalError.message);
      }

      if (canonical) {
        return emptyResult(canonical as ContactSettings, "database");
      }

      const { data, error } = await client
        .from("contact_settings")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? null) as ContactSettings | null, "database");
    } catch (error) {
      return emptyResult(null, "fallback", errorMessage(error));
    }
  }
);

export const getContactFormFields = cache(
  async (): Promise<ContentResult<ContactFormField[]>> => {
    const mode = contentMode();

    if (mode === "fallback" || !hasSupabaseEnv()) {
      return emptyResult([], "fallback");
    }

    try {
      const client = getSupabasePublicClient();
      const { data, error } = await client
        .from("contact_form_fields")
        .select("*")
        .eq("is_visible", true)
        .order("order_index", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return emptyResult((data ?? []) as ContactFormField[], "database");
    } catch (error) {
      return emptyResult([], "fallback", errorMessage(error));
    }
  }
);
