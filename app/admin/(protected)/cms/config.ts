export const CMS_TABLES = [
  "global_settings", "nav_items", "footer_links", "footer_social", "homepage_sections",
  "testimonials", "about_sections", "about_values", "team_members", "careers_roles",
  "careers_perks", "careers_process", "careers_faqs", "pricing_plans", "pricing_plan_features",
  "pricing_addons", "pricing_faqs", "pricing_included_features", "pricing_engagement_models",
  "contact_settings", "contact_form_fields", "page_sections",
] as const;
export type CmsTable = (typeof CMS_TABLES)[number];
export function isCmsTable(value: string): value is CmsTable {
  return (CMS_TABLES as readonly string[]).includes(value);
}
