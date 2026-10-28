/**
 * Drawtiq Content Migration Script
 *
 * Imports content from docs/content-snapshot.json into the Supabase CMS tables.
 *
 * Usage:
 *   npx tsx scripts/migrate-content.ts --token <SUPABASE_ACCESS_TOKEN> [--dry-run] [--force]
 *
 * Options:
 *   --token    Supabase access token (JWT) for an admin user. Obtain by signing
 *              in at /admin/login, then copy the access token from the browser's
 *              Supabase auth session (localStorage or dev tools).
 *   --dry-run  Report what would be inserted/skipped without writing to the DB.
 *   --force    Overwrite existing records that were previously imported by this
 *              script. Without --force, existing records are skipped.
 *
 * Safety:
 *   - Only upserts records belonging to this migration (matched by unique key).
 *   - Never deletes unrelated records.
 *   - Never overwrites existing records unless --force is passed.
 *   - All tables already have RLS: anon can read visible content, admins manage.
 *   - No service_role key is used; the script runs as an authenticated admin.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const SNAPSHOT_PATH = "docs/content-snapshot.json";
const GLOBAL_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";
const CONTACT_SETTINGS_ID = "00000000-0000-0000-0000-000000000002";

interface ImportReport {
  table: string;
  total: number;
  inserted: number;
  skipped: number;
  errors: Array<{ key: string; message: string }>;
}

interface MigrationContext {
  supabase: SupabaseClient;
  dryRun: boolean;
  force: boolean;
  reports: ImportReport[];
}

async function loadSnapshot() {
  const raw = readFileSync(SNAPSHOT_PATH, "utf8");
  return JSON.parse(raw);
}

function envOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function getSupabaseAdminClient(accessToken: string): Promise<SupabaseClient> {
  const url = envOrThrow("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = envOrThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

/**
 * Check whether a record already exists in a table by its unique key.
 * Returns true if the record exists (and should be skipped unless --force).
 */
async function recordExists(
  ctx: MigrationContext,
  table: string,
  uniqueKeys: string[] | string,
  uniqueValues: unknown[] | string
): Promise<boolean> {
  if (ctx.dryRun) {
    // In dry-run, we can't reliably check without a read. Assume not existing
    // so the report shows what *would* be inserted.
    return false;
  }

  const keys = Array.isArray(uniqueKeys) ? uniqueKeys : [uniqueKeys];
  const values = Array.isArray(uniqueValues) ? uniqueValues : [uniqueValues];

  let query = ctx.supabase.from(table).select(keys.join(","));
  for (let i = 0; i < keys.length; i++) {
    query = query.eq(keys[i], values[i]);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    // Table might not exist yet or column might be wrong
    return false;
  }

  return !!data;
}

async function upsertRecord(
  ctx: MigrationContext,
  table: string,
  record: Record<string, unknown>,
  uniqueKey: string | string[],
  uniqueValue: string | unknown[]
): Promise<{ action: "inserted" | "skipped" | "error"; message?: string }> {
  const keys = Array.isArray(uniqueKey) ? uniqueKey : [uniqueKey];
  const values = Array.isArray(uniqueValue) ? uniqueValue : [uniqueValue];

  const exists = await recordExists(ctx, table, keys, values);

  if (exists && !ctx.force) {
    return { action: "skipped", message: "Record already exists" };
  }

  if (ctx.dryRun) {
    return { action: exists ? "skipped" : "inserted" };
  }

  const { error } = await ctx.supabase.from(table).upsert(record, {
    onConflict: keys.join(","),
    ignoreDuplicates: false,
  });

  if (error) {
    return { action: "error", message: error.message };
  }

  return { action: exists ? "inserted" : "inserted" }; // updated counts as inserted for reporting
}

// ── Import functions per table ──────────────────────────────────────────────

async function importGlobalSettings(ctx: MigrationContext, snapshot: any) {
  const report: ImportReport = {
    table: "global_settings",
    total: 1,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  const gs = snapshot.globalSettings;
  const record = {
    site_name: gs.siteTitle,
    site_tagline: gs.siteDescription,
    logo_path: gs.logo,
    footer_logo_path: gs.footerLogo,
    contact_email: gs.contactEmail,
    careers_email: gs.careersEmail,
    footer_tagline: gs.footerTagline,
    footer_bottom_text: gs.footerBottom,
    copyright_holder: gs.copyrightPrefix,
    social_links: gs.footerSocial
      ? gs.footerSocial.map((s: any) => ({ label: s.label, href: s.href }))
      : [],
    seo_title: gs.siteTitle,
    seo_description: gs.siteDescription,
  };

  // Always use the fixed singleton id. The previous implementation first
  // upserted without an id, which inserted a new random-id row on every run.
  const exists = await recordExists(ctx, "global_settings", "id", GLOBAL_SETTINGS_ID);
  if (exists && !ctx.force) {
    report.skipped = 1;
  } else {
    if (ctx.dryRun) {
      report.inserted = 1;
    } else {
      const { error } = await ctx.supabase
        .from("global_settings")
        .upsert({ ...record, id: GLOBAL_SETTINGS_ID }, {
          onConflict: "id",
          ignoreDuplicates: false,
        });
      if (error) {
        report.errors.push({ key: "global_settings", message: error.message });
      } else {
        report.inserted = 1;
      }
    }
  }

  ctx.reports.push(report);
}

async function importNavItems(ctx: MigrationContext, snapshot: any) {
  const report: ImportReport = {
    table: "nav_items",
    total: snapshot.navItems.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of snapshot.navItems) {
    const record = {
      label: item.label,
      href: item.href,
      order_index: item.order ?? 0,
      is_visible: true,
      is_external: item.href.startsWith("http"),
    };

    const result = await upsertRecord(ctx, "nav_items", record, "href", item.href);
    if (result.action === "inserted") report.inserted++;
    else if (result.action === "skipped") report.skipped++;
    else report.errors.push({ key: item.href, message: result.message ?? "Unknown error" });
  }

  ctx.reports.push(report);
}

async function importFooterLinks(ctx: MigrationContext, snapshot: any) {
  const report: ImportReport = {
    table: "footer_links",
    total: snapshot.footerLinks.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of snapshot.footerLinks) {
    const record = {
      label: item.label,
      href: item.href,
      order_index: snapshot.footerLinks.indexOf(item),
      is_visible: true,
    };

    const result = await upsertRecord(ctx, "footer_links", record, "href", item.href);
    if (result.action === "inserted") report.inserted++;
    else if (result.action === "skipped") report.skipped++;
    else report.errors.push({ key: item.href, message: result.message ?? "Unknown error" });
  }

  ctx.reports.push(report);
}

async function importFooterSocial(ctx: MigrationContext, snapshot: any) {
  const report: ImportReport = {
    table: "footer_social",
    total: snapshot.footerSocial.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of snapshot.footerSocial) {
    const record = {
      label: item.label,
      href: item.href,
      order_index: snapshot.footerSocial.indexOf(item),
      is_visible: true,
    };

    const result = await upsertRecord(ctx, "footer_social", record, "href", item.href);
    if (result.action === "inserted") report.inserted++;
    else if (result.action === "skipped") report.skipped++;
    else report.errors.push({ key: item.href, message: result.message ?? "Unknown error" });
  }

  ctx.reports.push(report);
}

async function importHomepageSections(ctx: MigrationContext, snapshot: any) {
  const report: ImportReport = {
    table: "homepage_sections",
    total: 0,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  const hp = snapshot.homepage;
  const sections: Array<{ section_key: string; section_type: string; title?: string; subtitle?: string; content: any; order_index: number }> = [];

  // Build sections from the snapshot
  let order = 0;

  sections.push({
    section_key: "hero",
    section_type: "hero",
    title: hp.hero.heading,
    subtitle: hp.hero.intro,
    content: {
      eyebrow: hp.hero.eyebrow,
      ctaPrimary: hp.hero.ctaPrimary,
      ctaSecondary: hp.hero.ctaSecondary,
      footnote: hp.hero.footnote,
      artIndex: hp.hero.artIndex,
      artSticker: hp.hero.artSticker,
      floatingUiTop: hp.hero.floatingUiTop,
      floatingUiBottom: hp.hero.floatingUiBottom,
      artCaption: hp.hero.artCaption,
    },
    order_index: order++,
  });

  sections.push({
    section_key: "trust-strip",
    section_type: "trust-strip",
    title: hp.trustStrip.label,
    content: { principles: hp.trustStrip.principles },
    order_index: order++,
  });

  sections.push({
    section_key: "work-section",
    section_type: "work-section",
    title: hp.workSection.heading,
    subtitle: hp.workSection.eyebrow,
    content: {
      cta: hp.workSection.cta,
      bottomCta: hp.workSection.bottomCta,
      featuredProjects: hp.workSection.featuredProjects,
    },
    order_index: order++,
  });

  sections.push({
    section_key: "services-section",
    section_type: "services-section",
    title: hp.servicesSection.heading,
    subtitle: hp.servicesSection.eyebrow,
    content: {
      note: hp.servicesSection.note,
      footerNote: hp.servicesSection.footerNote,
    },
    order_index: order++,
  });

  sections.push({
    section_key: "process-section",
    section_type: "process-section",
    title: hp.processSection.heading,
    subtitle: hp.processSection.eyebrow,
    content: {
      note: hp.processSection.note,
      steps: hp.processSection.steps,
    },
    order_index: order++,
  });

  sections.push({
    section_key: "studio-section",
    section_type: "studio-section",
    title: hp.studioSection.heading,
    subtitle: hp.studioSection.eyebrow,
    content: {
      lead: hp.studioSection.lead,
      paragraphs: hp.studioSection.paragraphs,
      values: hp.studioSection.values,
      visualAsset: hp.studioSection.visualAsset,
      visualFallback: hp.studioSection.visualFallback,
      visualPoster: hp.studioSection.visualPoster,
    },
    order_index: order++,
  });

  sections.push({
    section_key: "testimonials",
    section_type: "testimonials",
    title: hp.testimonials.eyebrow,
    content: {
      note: hp.testimonials.note,
      items: hp.testimonials.items,
    },
    order_index: order++,
  });

  sections.push({
    section_key: "insights-section",
    section_type: "insights-section",
    title: hp.insightsSection.heading,
    subtitle: hp.insightsSection.eyebrow,
    content: {
      cta: hp.insightsSection.cta,
      featuredPosts: hp.insightsSection.featuredPosts,
    },
    order_index: order++,
  });

  sections.push({
    section_key: "contact-section",
    section_type: "contact-section",
    title: hp.contactSection.heading,
    subtitle: hp.contactSection.eyebrow,
    content: {
      paragraph: hp.contactSection.paragraph,
      email: hp.contactSection.email,
    },
    order_index: order++,
  });

  report.total = sections.length;

  for (const section of sections) {
    const result = await upsertRecord(ctx, "homepage_sections", {
      section_key: section.section_key,
      section_type: section.section_type,
      title: section.title,
      subtitle: section.subtitle,
      content: section.content,
      order_index: section.order_index,
      is_visible: true,
    }, "section_key", section.section_key);

    if (result.action === "inserted") report.inserted++;
    else if (result.action === "skipped") report.skipped++;
    else report.errors.push({ key: section.section_key, message: result.message ?? "Unknown error" });
  }

  ctx.reports.push(report);
}

async function importTestimonials(ctx: MigrationContext, snapshot: any) {
  const testimonials = snapshot.homepage?.testimonials;

  if (!testimonials || !Array.isArray(testimonials.items)) {
    throw new Error(
      "Snapshot validation failed: 'homepage.testimonials.items' is missing or not an array. " +
        "Check docs/content-snapshot.json for the testimonials section."
    );
  }

  const report: ImportReport = {
    table: "testimonials",
    total: testimonials.items.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of testimonials.items) {
    const record = {
      quote: item.quote,
      emphasis: item.emphasis,
      number: item.number,
      label: item.label,
      order_index: parseInt(item.number, 10) || 0,
      is_visible: true,
    };

    const result = await upsertRecord(ctx, "testimonials", record, "number", item.number);
    if (result.action === "inserted") report.inserted++;
    else if (result.action === "skipped") report.skipped++;
    else report.errors.push({ key: item.number, message: result.message ?? "Unknown error" });
  }

  ctx.reports.push(report);
}

async function importTeamMembers(ctx: MigrationContext, snapshot: any) {
  const report: ImportReport = {
    table: "team_members",
    total: snapshot.about.team.members.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of snapshot.about.team.members) {
    const record = {
      role: item.role,
      discipline: item.discipline,
      order_index: snapshot.about.team.members.indexOf(item),
      is_visible: true,
    };

    const result = await upsertRecord(ctx, "team_members", record, "role", item.role);
    if (result.action === "inserted") report.inserted++;
    else if (result.action === "skipped") report.skipped++;
    else report.errors.push({ key: item.role, message: result.message ?? "Unknown error" });
  }

  ctx.reports.push(report);
}

async function importAboutValues(ctx: MigrationContext, snapshot: any) {
  const report: ImportReport = {
    table: "about_values",
    total: snapshot.about.values.items.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of snapshot.about.values.items) {
    const record = {
      index_label: item.index,
      title: item.title,
      body: item.body,
      order_index: snapshot.about.values.items.indexOf(item),
      is_visible: true,
    };

    const result = await upsertRecord(ctx, "about_values", record, "index_label", item.index);
    if (result.action === "inserted") report.inserted++;
    else if (result.action === "skipped") report.skipped++;
    else report.errors.push({ key: item.index, message: result.message ?? "Unknown error" });
  }

  ctx.reports.push(report);
}

async function importAboutSections(ctx: MigrationContext, snapshot: any) {
  const report: ImportReport = {
    table: "about_sections",
    total: 0,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  const ab = snapshot.about;
  const sections: Array<{ section_key: string; title?: string; content: any; order_index: number }> = [];
  let order = 0;

  sections.push({
    section_key: "hero",
    title: ab.hero.heading,
    content: {
      eyebrow: ab.hero.eyebrow,
      lead: ab.hero.lead,
    },
    order_index: order++,
  });

  sections.push({
    section_key: "studio-band",
    content: {
      image: ab.studioBand.image,
      imageSet: ab.studioBand.imageSet,
      captionEyebrow: ab.studioBand.captionEyebrow,
      caption: ab.studioBand.caption,
    },
    order_index: order++,
  });

  sections.push({
    section_key: "point-of-view",
    title: ab.pointOfView.heading,
    content: {
      eyebrow: ab.pointOfView.eyebrow,
      paragraphs: ab.pointOfView.paragraphs,
    },
    order_index: order++,
  });

  sections.push({
    section_key: "values",
    title: ab.values.heading,
    content: {
      eyebrow: ab.values.eyebrow,
    },
    order_index: order++,
  });

  sections.push({
    section_key: "team",
    title: ab.team.heading,
    content: {
      eyebrow: ab.team.eyebrow,
      note: ab.team.note,
      disclaimer: ab.team.disclaimer,
    },
    order_index: order++,
  });

  sections.push({
    section_key: "cta",
    title: ab.cta.heading,
    content: {
      paragraph: ab.cta.paragraph,
      button: ab.cta.button,
    },
    order_index: order++,
  });

  report.total = sections.length;

  for (const section of sections) {
    const result = await upsertRecord(ctx, "about_sections", {
      section_key: section.section_key,
      title: section.title,
      content: section.content,
      order_index: section.order_index,
      is_visible: true,
    }, "section_key", section.section_key);

    if (result.action === "inserted") report.inserted++;
    else if (result.action === "skipped") report.skipped++;
    else report.errors.push({ key: section.section_key, message: result.message ?? "Unknown error" });
  }

  ctx.reports.push(report);
}

async function importCareers(ctx: MigrationContext, snapshot: any) {
  const cr = snapshot.careers;

  // Hero + sections as about_sections-style? No, careers uses its own tables.
  // Roles
  const rolesReport: ImportReport = {
    table: "careers_roles",
    total: cr.roles.items.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };
  for (const item of cr.roles.items) {
    const result = await upsertRecord(ctx, "careers_roles", {
      title: item.title,
      meta: item.meta,
      body: item.body,
      order_index: cr.roles.items.indexOf(item),
      is_visible: true,
    }, "title", item.title);
    if (result.action === "inserted") rolesReport.inserted++;
    else if (result.action === "skipped") rolesReport.skipped++;
    else rolesReport.errors.push({ key: item.title, message: result.message ?? "Unknown error" });
  }
  ctx.reports.push(rolesReport);

  // Perks
  const perksReport: ImportReport = {
    table: "careers_perks",
    total: cr.perks.items.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };
  for (const item of cr.perks.items) {
    const result = await upsertRecord(ctx, "careers_perks", {
      number: item.number,
      title: item.title,
      body: item.body,
      order_index: cr.perks.items.indexOf(item),
      is_visible: true,
    }, "number", item.number);
    if (result.action === "inserted") perksReport.inserted++;
    else if (result.action === "skipped") perksReport.skipped++;
    else perksReport.errors.push({ key: item.number, message: result.message ?? "Unknown error" });
  }
  ctx.reports.push(perksReport);

  // Process
  const processReport: ImportReport = {
    table: "careers_process",
    total: cr.hiringProcess.steps.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };
  for (const item of cr.hiringProcess.steps) {
    const result = await upsertRecord(ctx, "careers_process", {
      number: item.number,
      title: item.title,
      body: item.body,
      order_index: cr.hiringProcess.steps.indexOf(item),
      is_visible: true,
    }, "number", item.number);
    if (result.action === "inserted") processReport.inserted++;
    else if (result.action === "skipped") processReport.skipped++;
    else processReport.errors.push({ key: item.number, message: result.message ?? "Unknown error" });
  }
  ctx.reports.push(processReport);

  // FAQs
  const faqsReport: ImportReport = {
    table: "careers_faqs",
    total: cr.faqs.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };
  for (const item of cr.faqs) {
    const result = await upsertRecord(ctx, "careers_faqs", {
      question: item.q,
      answer: item.a,
      order_index: cr.faqs.indexOf(item),
      is_visible: true,
    }, "question", item.q);
    if (result.action === "inserted") faqsReport.inserted++;
    else if (result.action === "skipped") faqsReport.skipped++;
    else faqsReport.errors.push({ key: item.q, message: result.message ?? "Unknown error" });
  }
  ctx.reports.push(faqsReport);
}

async function importPricing(ctx: MigrationContext, snapshot: any) {
  const pr = snapshot.pricing;

  // Plans
  const plansReport: ImportReport = {
    table: "pricing_plans",
    total: pr.plans.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };
  const planIds: Record<string, string> = {};
  for (const plan of pr.plans) {
    const record = {
      name: plan.name,
      tagline: plan.tagline,
      monthly_price: plan.monthly,
      quarterly_price: plan.quarterly,
      cta_label: plan.cta,
      is_featured: plan.featured ?? false,
      order_index: pr.plans.indexOf(plan),
      is_visible: true,
    };
    const result = await upsertRecord(ctx, "pricing_plans", record, "name", plan.name);
    if (result.action === "inserted") plansReport.inserted++;
    else if (result.action === "skipped") plansReport.skipped++;
    else plansReport.errors.push({ key: plan.name, message: result.message ?? "Unknown error" });
  }
  ctx.reports.push(plansReport);

  // Plan features (need plan IDs - fetch them)
  if (!ctx.dryRun) {
    const { data: plans } = await ctx.supabase.from("pricing_plans").select("id, name");
    for (const plan of pr.plans) {
      const dbPlan = plans?.find((p: any) => p.name === plan.name);
      if (!dbPlan) continue;
      planIds[plan.name] = dbPlan.id;

      const featuresReport: ImportReport = {
        table: "pricing_plan_features",
        total: plan.features.length,
        inserted: 0,
        skipped: 0,
        errors: [],
      };
      for (const feature of plan.features) {
        const result = await upsertRecord(ctx, "pricing_plan_features", {
          plan_id: dbPlan.id,
          feature_text: feature,
          order_index: plan.features.indexOf(feature),
        }, ["plan_id", "feature_text"], [dbPlan.id, feature]);
        if (result.action === "inserted") featuresReport.inserted++;
        else if (result.action === "skipped") featuresReport.skipped++;
        else featuresReport.errors.push({ key: feature, message: result.message ?? "Unknown error" });
      }
      ctx.reports.push(featuresReport);
    }
  }

  // Included features
  const includedReport: ImportReport = {
    table: "pricing_included_features",
    total: pr.includedFeatures.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };
  for (const item of pr.includedFeatures) {
    const result = await upsertRecord(ctx, "pricing_included_features", {
      feature_text: item,
      order_index: pr.includedFeatures.indexOf(item),
      is_visible: true,
    }, "feature_text", item);
    if (result.action === "inserted") includedReport.inserted++;
    else if (result.action === "skipped") includedReport.skipped++;
    else includedReport.errors.push({ key: item, message: result.message ?? "Unknown error" });
  }
  ctx.reports.push(includedReport);

  // Engagement models
  const modelsReport: ImportReport = {
    table: "pricing_engagement_models",
    total: pr.engagementModels.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };
  for (const item of pr.engagementModels) {
    const result = await upsertRecord(ctx, "pricing_engagement_models", {
      number: item.number,
      title: item.title,
      body: item.body,
      order_index: pr.engagementModels.indexOf(item),
      is_visible: true,
    }, "number", item.number);
    if (result.action === "inserted") modelsReport.inserted++;
    else if (result.action === "skipped") modelsReport.skipped++;
    else modelsReport.errors.push({ key: item.number, message: result.message ?? "Unknown error" });
  }
  ctx.reports.push(modelsReport);

  // Add-ons
  const addonsReport: ImportReport = {
    table: "pricing_addons",
    total: pr.addons.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };
  for (const item of pr.addons) {
    const result = await upsertRecord(ctx, "pricing_addons", {
      title: item.title,
      price: item.price,
      note: item.note,
      order_index: pr.addons.indexOf(item),
      is_visible: true,
    }, "title", item.title);
    if (result.action === "inserted") addonsReport.inserted++;
    else if (result.action === "skipped") addonsReport.skipped++;
    else addonsReport.errors.push({ key: item.title, message: result.message ?? "Unknown error" });
  }
  ctx.reports.push(addonsReport);

  // Pricing FAQs
  const pricingFaqsReport: ImportReport = {
    table: "pricing_faqs",
    total: pr.faqs.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };
  for (const item of pr.faqs) {
    const result = await upsertRecord(ctx, "pricing_faqs", {
      question: item.q,
      answer: item.a,
      order_index: pr.faqs.indexOf(item),
      is_visible: true,
    }, "question", item.q);
    if (result.action === "inserted") pricingFaqsReport.inserted++;
    else if (result.action === "skipped") pricingFaqsReport.skipped++;
    else pricingFaqsReport.errors.push({ key: item.q, message: result.message ?? "Unknown error" });
  }
  ctx.reports.push(pricingFaqsReport);
}

async function importContact(ctx: MigrationContext, snapshot: any) {
  const ct = snapshot.contact;

  // Contact settings (singleton)
  const settingsReport: ImportReport = {
    table: "contact_settings",
    total: 1,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  const exists = await recordExists(ctx, "contact_settings", "id", CONTACT_SETTINGS_ID);
  if (exists && !ctx.force) {
    settingsReport.skipped = 1;
  } else {
    if (ctx.dryRun) {
      settingsReport.inserted = 1;
    } else {
      const { error } = await ctx.supabase
        .from("contact_settings")
        .upsert(
          {
            id: CONTACT_SETTINGS_ID,
            hero_eyebrow: ct.hero.eyebrow,
            hero_heading: ct.hero.heading,
            hero_lead: ct.hero.lead,
            copy_eyebrow: ct.copy.eyebrow,
            copy_heading: ct.copy.heading,
            copy_paragraph: ct.copy.paragraph,
            email_label: ct.copy.email.label,
            email_address: ct.copy.email.href.replace("mailto:", ""),
            form_heading: ct.form.heading,
            form_subheading: ct.form.subheading,
            submit_label: ct.form.submit.label,
            hint_text: ct.form.hint,
          },
          { onConflict: "id", ignoreDuplicates: false }
        );
      if (error) {
        settingsReport.errors.push({ key: "contact_settings", message: error.message });
      } else {
        settingsReport.inserted = 1;
      }
    }
  }
  ctx.reports.push(settingsReport);

  // Contact form fields
  const fieldsReport: ImportReport = {
    table: "contact_form_fields",
    total: ct.form.fields.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };
  for (const field of ct.form.fields) {
    const result = await upsertRecord(ctx, "contact_form_fields", {
      field_name: field.name,
      field_label: field.label,
      field_type: field.type,
      is_required: field.required ?? true,
      placeholder: field.placeholder,
      options: field.options ?? [],
      order_index: ct.form.fields.indexOf(field),
      is_visible: true,
    }, "field_name", field.name);
    if (result.action === "inserted") fieldsReport.inserted++;
    else if (result.action === "skipped") fieldsReport.skipped++;
    else fieldsReport.errors.push({ key: field.name, message: result.message ?? "Unknown error" });
  }
  ctx.reports.push(fieldsReport);
}

async function importProjects(ctx: MigrationContext, snapshot: any) {
  const report: ImportReport = {
    table: "projects",
    total: snapshot.projects.items.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of snapshot.projects.items) {
    const record = {
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle,
      category: item.category,
      discipline: item.discipline,
      industry: item.industry,
      scope: item.scope,
      summary: item.summary,
      challenge: item.challenge,
      approach: item.approach,
      solution: item.solution,
      outcome: item.outcome,
      visual_key: item.visualKey,
      featured: item.featured ?? false,
      sort_order: item.sortOrder ?? 0,
      gallery: item.gallery ?? [],
      seo_title: item.seoTitle,
      seo_description: item.seoDescription,
      status: "draft", // Start as draft; admin publishes after review
      created_by: null,
    };

    const result = await upsertRecord(ctx, "projects", record, "slug", item.slug);
    if (result.action === "inserted") report.inserted++;
    else if (result.action === "skipped") report.skipped++;
    else report.errors.push({ key: item.slug, message: result.message ?? "Unknown error" });
  }

  ctx.reports.push(report);
}

async function importServices(ctx: MigrationContext, snapshot: any) {
  const report: ImportReport = {
    table: "services",
    total: snapshot.services.items.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of snapshot.services.items) {
    const record = {
      slug: item.slug,
      title: item.title,
      blurb: item.blurb,
      intro: null,
      icon: item.icon,
      preview_path: null,
      tags: item.tags ?? [],
      deliverables: [],
      faqs: [],
      status: "draft",
      sort_order: item.sortOrder ?? 0,
      seo_title: null,
      seo_description: null,
      created_by: null,
    };

    const result = await upsertRecord(ctx, "services", record, "slug", item.slug);
    if (result.action === "inserted") report.inserted++;
    else if (result.action === "skipped") report.skipped++;
    else report.errors.push({ key: item.slug, message: result.message ?? "Unknown error" });
  }

  ctx.reports.push(report);
}

async function importInsights(ctx: MigrationContext, snapshot: any) {
  const report: ImportReport = {
    table: "blog_posts",
    total: snapshot.insights.items.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  for (const item of snapshot.insights.items) {
    const record = {
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      category: item.category,
      read_time: item.readTime,
      visual: item.visual,
      label: item.label,
      display: { html: item.display },
      body: item.body,
      status: "draft",
      sort_order: snapshot.insights.items.indexOf(item) + 1,
      seo_title: null,
      seo_description: null,
      created_by: null,
    };

    const result = await upsertRecord(ctx, "blog_posts", record, "slug", item.slug);
    if (result.action === "inserted") report.inserted++;
    else if (result.action === "skipped") report.skipped++;
    else report.errors.push({ key: item.slug, message: result.message ?? "Unknown error" });
  }

  ctx.reports.push(report);
}

// ── Main ───────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]) {
  const args: { token?: string; dryRun: boolean; force: boolean } = {
    dryRun: false,
    force: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--force") args.force = true;
    else if (arg === "--token" && i + 1 < argv.length) {
      args.token = argv[++i];
    }
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.token) {
    console.error("Error: --token is required.");
    console.error("");
    console.error("Usage: npx tsx scripts/migrate-content.ts --token <SUPABASE_ACCESS_TOKEN_OR_COOKIE_VALUE> [--dry-run] [--force]");
    console.error("");
    console.error("Accepts either:");
    console.error("  - A raw Supabase access token (JWT starting with eyJ, 2 dots)");
    console.error("  - The raw sb-*-auth-token cookie value (base64-encoded JSON)");
    console.error("");
    console.error("To get the cookie value:");
    console.error("  1. Sign in at /admin/login");
    console.error("  2. Open DevTools → Application → Cookies → http://localhost:3000");
    console.error("  3. Click the row sb-cpirkzcffqkzktdlboip-auth-token");
    console.error("  4. Copy the full Value from the right panel");
    process.exit(1);
  }

  // Resolve the token: accept either a raw JWT or a base64-encoded cookie value.
  let accessToken = args.token;
  const dotCount = (accessToken.match(/\./g) || []).length;

  if (dotCount !== 2) {
    // Not a raw JWT. Try treating it as a base64-encoded cookie value.
    let cookieValue = accessToken;

    // Strip optional "base64-" prefix some Supabase versions add.
    if (cookieValue.startsWith("base64-")) {
      cookieValue = cookieValue.slice("base64-".length);
    }

    let decoded: string;
    try {
      decoded = Buffer.from(cookieValue, "base64").toString("utf8");
    } catch {
      console.error("Error: --token is not a valid JWT or base64-encoded cookie value.");
      console.error("");
      console.error("A valid JWT has 3 parts separated by dots (header.payload.signature).");
      console.error("A cookie value should be base64-encoded JSON containing an access_token field.");
      process.exit(1);
    }

    let parsed: { access_token?: string };
    try {
      parsed = JSON.parse(decoded);
    } catch {
      console.error("Error: Decoded cookie value is not valid JSON.");
      process.exit(1);
    }

    if (!parsed.access_token) {
      console.error("Error: Decoded cookie value does not contain an access_token field.");
      process.exit(1);
    }

    accessToken = parsed.access_token;
  }

  // Final validation: must be a JWT with 2 dots.
  const finalDotCount = (accessToken.match(/\./g) || []).length;
  if (finalDotCount !== 2) {
    console.error("Error: Resolved access token is not a valid JWT.");
    console.error("");
    console.error("A valid access token has 3 parts separated by dots (header.payload.signature).");
    process.exit(1);
  }

  const ctx: MigrationContext = {
    supabase: await getSupabaseAdminClient(accessToken),
    dryRun: args.dryRun,
    force: args.force,
    reports: [],
  };

  console.log(`Drawtiq Content Migration`);
  console.log(`Mode: ${ctx.dryRun ? "DRY-RUN" : "LIVE"}`);
  console.log(`Force overwrite: ${ctx.force}`);
  console.log("");

  const snapshot = await loadSnapshot();

  // ── Snapshot validation ─────────────────────────────────────────────────
  // Validate required data exists before any import attempt. DRY-RUN performs
  // no database writes; this validation only reads the snapshot file.

  const requiredTopLevel = [
    "globalSettings",
    "navItems",
    "footerLinks",
    "footerSocial",
    "homepage",
    "about",
    "careers",
    "contact",
    "pricing",
    "services",
    "projects",
    "insights",
  ];

  const missingTopLevel = requiredTopLevel.filter(
    (key) => !(key in snapshot)
  );

  if (missingTopLevel.length > 0) {
    throw new Error(
      "Snapshot validation failed: missing required top-level keys: " +
        missingTopLevel.join(", ") +
        ". Check docs/content-snapshot.json."
    );
  }

  const hp = snapshot.homepage;
  const requiredHomepage = [
    "hero",
    "trustStrip",
    "workSection",
    "servicesSection",
    "processSection",
    "studioSection",
    "testimonials",
    "insightsSection",
    "contactSection",
  ];
  const missingHomepage = requiredHomepage.filter((key) => !(key in hp));
  if (missingHomepage.length > 0) {
    throw new Error(
      "Snapshot validation failed: missing homepage sections: " +
        missingHomepage.join(", ") +
        ". Check docs/content-snapshot.json."
    );
  }

  if (!Array.isArray(hp.testimonials?.items)) {
    throw new Error(
      "Snapshot validation failed: 'homepage.testimonials.items' is missing or not an array. " +
        "Check docs/content-snapshot.json."
    );
  }

  if (!Array.isArray(snapshot.projects?.items)) {
    throw new Error(
      "Snapshot validation failed: 'projects.items' is missing or not an array."
    );
  }

  if (!Array.isArray(snapshot.services?.items)) {
    throw new Error(
      "Snapshot validation failed: 'services.items' is missing or not an array."
    );
  }

  if (!Array.isArray(snapshot.insights?.items)) {
    throw new Error(
      "Snapshot validation failed: 'insights.items' is missing or not an array."
    );
  }

  console.log(
    `Snapshot validated: ${snapshot.homepage.testimonials.items.length} testimonials, ` +
      `${snapshot.projects.items.length} projects, ` +
      `${snapshot.services.items.length} services, ` +
      `${snapshot.insights.items.length} insights.`
  );
  console.log("");

  try {
    await importGlobalSettings(ctx, snapshot);
    await importNavItems(ctx, snapshot);
    await importFooterLinks(ctx, snapshot);
    await importFooterSocial(ctx, snapshot);
    await importHomepageSections(ctx, snapshot);
    await importTestimonials(ctx, snapshot);
    await importTeamMembers(ctx, snapshot);
    await importAboutValues(ctx, snapshot);
    await importAboutSections(ctx, snapshot);
    await importCareers(ctx, snapshot);
    await importPricing(ctx, snapshot);
    await importContact(ctx, snapshot);
    await importProjects(ctx, snapshot);
    await importServices(ctx, snapshot);
    await importInsights(ctx, snapshot);
  } catch (err) {
    console.error("Fatal error during import:", err);
    process.exit(1);
  }

  // ── Report ──────────────────────────────────────────────────────────────

  console.log("Import Report");
  console.log("=============");
  console.log("");

  let grandTotal = 0;
  let grandInserted = 0;
  let grandSkipped = 0;
  let grandErrors = 0;

  for (const report of ctx.reports) {
    grandTotal += report.total;
    grandInserted += report.inserted;
    grandSkipped += report.skipped;
    grandErrors += report.errors.length;

    const status = report.errors.length > 0 ? "ERRORS" : report.skipped === report.total ? "SKIPPED" : "OK";
    console.log(`${report.table.padEnd(30)} total=${String(report.total).padStart(3)} inserted=${String(report.inserted).padStart(3)} skipped=${String(report.skipped).padStart(3)} errors=${String(report.errors.length).padStart(3)}  [${status}]`);

    for (const err of report.errors) {
      console.log(`    ✗ ${err.key}: ${err.message}`);
    }
  }

  console.log("");
  console.log(`Grand total:  ${grandTotal}`);
  console.log(`Inserted:     ${grandInserted}`);
  console.log(`Skipped:      ${grandSkipped}`);
  console.log(`Errors:       ${grandErrors}`);

  if (ctx.dryRun) {
    console.log("");
    console.log("This was a dry-run. No changes were written to the database.");
    console.log("Run without --dry-run to apply the import.");
  } else if (grandErrors === 0) {
    console.log("");
    console.log("Import complete. All content tables now contain records.");
    console.log("Content is in 'draft' status — publish via the admin panel before it appears publicly.");
  } else {
    console.log("");
    console.log("Import completed with errors. Review the error list above.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
