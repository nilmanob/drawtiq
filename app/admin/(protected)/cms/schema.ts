import type { AdminFormField, AdminFormFieldType } from "@/lib/admin/form-types";

export type CmsField = {
  name: string;
  label: string;
  type: AdminFormFieldType;
  required?: boolean;
  hint?: string;
  rows?: number;
  options?: string[];
  json?: boolean;
  num?: boolean;
  bool?: boolean;
  fullWidth?: boolean;
  mono?: boolean;
  placeholder?: string;
};

const visible: CmsField = { name: "is_visible", label: "Visible", type: "checkbox", bool: true };
const order: CmsField = { name: "order_index", label: "Order", type: "number", num: true, hint: "Lower numbers appear first." };

export const SINGLETON_TABLES = ["global_settings", "contact_settings"] as const;

export const CMS_SCHEMAS: Record<string, CmsField[]> = {
  global_settings: [
    { name: "site_name", label: "Site name", type: "text", required: true },
    { name: "site_tagline", label: "Site tagline", type: "text" },
    { name: "logo_path", label: "Logo path", type: "text", mono: true },
    { name: "footer_logo_path", label: "Footer logo path", type: "text", mono: true },
    { name: "contact_email", label: "Contact email", type: "email" },
    { name: "careers_email", label: "Careers email", type: "email" },
    { name: "footer_tagline", label: "Footer tagline", type: "text" },
    { name: "footer_bottom_text", label: "Footer bottom text", type: "text" },
    { name: "copyright_holder", label: "Copyright holder", type: "text" },
    { name: "social_links", label: "Social links JSON", type: "json", json: true, fullWidth: true },
    { name: "seo_title", label: "Default SEO title", type: "text", fullWidth: true },
    { name: "seo_description", label: "Default SEO description", type: "textarea", rows: 3, fullWidth: true },
  ],
  nav_items: [
    { name: "label", label: "Label", type: "text", required: true },
    { name: "href", label: "Link", type: "text", required: true, mono: true },
    order,
    visible,
    { name: "is_external", label: "Opens in a new tab", type: "checkbox", bool: true },
  ],
  footer_links: [
    { name: "label", label: "Label", type: "text", required: true },
    { name: "href", label: "Link", type: "text", required: true, mono: true },
    order,
    visible,
  ],
  footer_social: [
    { name: "label", label: "Label", type: "text", required: true },
    { name: "href", label: "Link", type: "text", required: true, mono: true },
    order,
    visible,
  ],
  homepage_sections: [
    { name: "section_key", label: "Section key", type: "text", required: true, mono: true, hint: "hero, trust-strip, work-section, services-section, process-section, studio-section, testimonials, insights-section, contact-section. contact-section content.fieldNames selects which contact_form_fields appear on the homepage." },
    { name: "title", label: "Title", type: "text", hint: "When set, overrides this section's content.heading (or label/eyebrow for some sections). Leave blank to use Content JSON." },
    { name: "subtitle", label: "Subtitle", type: "text", hint: "When set, overrides this section's content.eyebrow/intro where supported. Leave blank to use Content JSON." },
    { name: "content", label: "Content JSON", type: "json", json: true, required: true, fullWidth: true, rows: 18 },
    order,
    visible,
  ],
  testimonials: [
    { name: "quote", label: "Quote", type: "textarea", required: true, rows: 4, fullWidth: true },
    { name: "emphasis", label: "Emphasis", type: "text", hint: "Text inside the quote to italicise. Leave blank to emphasise the whole quote." },
    { name: "number", label: "Number", type: "text" },
    { name: "label", label: "Label", type: "text" },
    order,
    visible,
  ],
  about_sections: [
    { name: "section_key", label: "Section key", type: "text", required: true, mono: true, hint: "hero, point-of-view, values, team, cta." },
    { name: "title", label: "Title", type: "text" },
    { name: "content", label: "Content JSON", type: "json", json: true, required: true, fullWidth: true, rows: 16 },
    order,
    visible,
  ],
  about_values: [
    { name: "index_label", label: "Index label", type: "text", required: true, hint: "e.g. 01 / CURIOUS" },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "body", label: "Body", type: "textarea", required: true, rows: 3, fullWidth: true },
    order,
    visible,
  ],
  team_members: [
    { name: "role", label: "Role", type: "text", required: true },
    { name: "discipline", label: "Discipline", type: "text" },
    order,
    visible,
  ],
  careers_roles: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "meta", label: "Meta", type: "text", hint: "e.g. Full-time · Remote" },
    { name: "body", label: "Body", type: "textarea", required: true, rows: 4, fullWidth: true },
    order,
    visible,
  ],
  careers_perks: [
    { name: "number", label: "Number", type: "text", required: true },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "body", label: "Body", type: "textarea", required: true, rows: 3, fullWidth: true },
    order,
    visible,
  ],
  careers_process: [
    { name: "number", label: "Number", type: "text", required: true },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "body", label: "Body", type: "textarea", required: true, rows: 3, fullWidth: true },
    order,
    visible,
  ],
  careers_faqs: [
    { name: "question", label: "Question", type: "text", required: true, fullWidth: true },
    { name: "answer", label: "Answer", type: "textarea", required: true, rows: 4, fullWidth: true },
    order,
    visible,
  ],
  pricing_plans: [
    { name: "name", label: "Plan name", type: "text", required: true },
    { name: "tagline", label: "Tagline", type: "text", fullWidth: true },
    { name: "monthly_price", label: "Monthly price", type: "number", num: true },
    { name: "quarterly_price", label: "Quarterly price", type: "number", num: true },
    { name: "cta_label", label: "CTA label", type: "text" },
    { name: "is_featured", label: "Featured plan", type: "checkbox", bool: true },
    order,
    visible,
  ],
  pricing_plan_features: [
    { name: "plan_id", label: "Plan ID", type: "text", required: true, mono: true, hint: "Copy the ID of the pricing plan this feature belongs to." },
    { name: "feature_text", label: "Feature", type: "text", required: true, fullWidth: true },
    order,
  ],
  pricing_addons: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "price", label: "Price", type: "text", required: true },
    { name: "note", label: "Note", type: "textarea", rows: 2, fullWidth: true },
    order,
    visible,
  ],
  pricing_faqs: [
    { name: "question", label: "Question", type: "text", required: true, fullWidth: true },
    { name: "answer", label: "Answer", type: "textarea", required: true, rows: 4, fullWidth: true },
    order,
    visible,
  ],
  pricing_included_features: [
    { name: "feature_text", label: "Feature", type: "text", required: true, fullWidth: true },
    order,
    visible,
  ],
  pricing_engagement_models: [
    { name: "number", label: "Number", type: "text", required: true },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "body", label: "Body", type: "textarea", required: true, rows: 3, fullWidth: true },
    order,
    visible,
  ],
  contact_settings: [
    { name: "hero_eyebrow", label: "Hero eyebrow", type: "text" },
    { name: "hero_heading", label: "Hero heading", type: "text", fullWidth: true, hint: "Basic HTML such as <br /> and <em> is supported." },
    { name: "hero_lead", label: "Hero lead", type: "textarea", rows: 2, fullWidth: true },
    { name: "copy_eyebrow", label: "Copy eyebrow", type: "text" },
    { name: "copy_heading", label: "Copy heading", type: "text", fullWidth: true },
    { name: "copy_paragraph", label: "Copy paragraph", type: "textarea", rows: 3, fullWidth: true },
    { name: "email_label", label: "Email label", type: "text" },
    { name: "email_address", label: "Email address", type: "email" },
    { name: "form_heading", label: "Form heading", type: "text" },
    { name: "form_subheading", label: "Form subheading", type: "text", fullWidth: true },
    { name: "submit_label", label: "Submit label", type: "text" },
    { name: "hint_text", label: "Form hint", type: "textarea", rows: 2, fullWidth: true },
  ],
  contact_form_fields: [
    { name: "field_name", label: "Field name", type: "text", required: true, mono: true },
    { name: "field_label", label: "Label", type: "text", required: true },
    { name: "field_type", label: "Type", type: "select", required: true, options: ["text", "email", "select", "textarea", "file"] },
    { name: "placeholder", label: "Placeholder", type: "text" },
    { name: "options", label: "Select options JSON", type: "json", json: true, fullWidth: true, hint: "JSON array of strings, used for select fields." },
    { name: "is_required", label: "Required", type: "checkbox", bool: true },
    order,
    visible,
  ],
  page_sections: [
    { name: "page_key", label: "Page key", type: "text", required: true, mono: true, hint: "homepage, work, services, case-studies, service-details, insights, insights-detail, pricing, careers, contact, about, global." },
    { name: "section_key", label: "Section key", type: "text", required: true, mono: true, hint: "homepage/work/services/insights/pricing/careers/contact/about: seo (page metadata) · work: hero, cta, filters · services: hero, note, engagement-panels, list, cta · case-studies/service-details/insights-detail: shared · insights: hero, list, cta · pricing: copy · careers: hero, why, roles, role-open, hiring, faq, cta · contact: next-steps · global: site." },
    { name: "content", label: "Content JSON", type: "json", json: true, required: true, fullWidth: true, rows: 18 },
    order,
    visible,
    { name: "seo_title", label: "Page SEO title", type: "text", fullWidth: true, hint: "Fill on any one visible section for this page." },
    { name: "seo_description", label: "Page SEO description", type: "textarea", rows: 3, fullWidth: true },
  ],
};

export function fieldsFor(table: string, record?: Record<string, unknown>): AdminFormField[] {
  return (CMS_SCHEMAS[table] ?? []).map((field) => ({
    name: field.name,
    label: field.label,
    type: field.type,
    required: field.required,
    hint: field.hint,
    placeholder: field.placeholder,
    rows: field.rows,
    fullWidth: field.fullWidth,
    mono: field.mono,
    options: field.options?.map((value) => ({ value, label: value })),
    defaultValue:
      field.json
        ? JSON.stringify(record?.[field.name] ?? (field.name === "content" ? {} : []), null, 2)
        : field.type === "checkbox"
          ? Boolean(record?.[field.name] ?? (field.name === "is_visible" || field.name === "is_required"))
          : Number.isFinite(record?.[field.name] as number)
            ? (record?.[field.name] as number)
            : String(record?.[field.name] ?? (field.name === "order_index" ? 0 : field.name === "field_type" ? "text" : "")),
  }));
}

export const CMS_TABLE_LABELS: Record<string, string> = {
  global_settings: "Global settings",
  nav_items: "Navigation",
  footer_links: "Footer links",
  footer_social: "Footer social",
  homepage_sections: "Homepage sections",
  testimonials: "Testimonials",
  about_sections: "About sections",
  about_values: "About values",
  team_members: "Team & disciplines",
  careers_roles: "Careers roles",
  careers_perks: "Careers perks",
  careers_process: "Careers hiring steps",
  careers_faqs: "Careers FAQs",
  pricing_plans: "Pricing plans",
  pricing_plan_features: "Pricing plan features",
  pricing_addons: "Pricing add-ons",
  pricing_faqs: "Pricing FAQs",
  pricing_included_features: "Pricing included features",
  pricing_engagement_models: "Pricing engagement models",
  contact_settings: "Contact settings",
  contact_form_fields: "Contact form fields",
  page_sections: "Page sections",
};

export const CMS_TABLE_DESCRIPTIONS: Record<string, string> = {
  global_settings: "Singleton site name, logo, emails, footer copy, and default SEO. The lowest-ID row is canonical; legacy duplicate rows should be cleaned up separately.",
  nav_items: "Header navigation. Lower order numbers appear first.",
  footer_links: "Footer link lists. Lower order numbers appear first.",
  footer_social: "Footer social and contact links.",
  homepage_sections: "Homepage composition. Visible records render in order; hidden records are omitted while other sections remain. Title and Subtitle override matching Content JSON fields when set.",
  testimonials: "Homepage testimonial carousel items.",
  about_sections: "About page section content such as hero, point of view, values, team, and CTA.",
  about_values: "About page belief cards.",
  team_members: "About page team roles and disciplines.",
  careers_roles: "Open roles shown on the careers page.",
  careers_perks: "Careers page benefits and ways of working.",
  careers_process: "Careers page hiring steps.",
  careers_faqs: "Careers page questions and answers.",
  pricing_plans: "Pricing plans, prices, CTA labels, and featured state.",
  pricing_plan_features: "Features listed inside each pricing plan.",
  pricing_addons: "Pricing page add-on services.",
  pricing_faqs: "Pricing page questions and answers.",
  pricing_included_features: "Features included in every pricing plan.",
  pricing_engagement_models: "Ways to work panels on the pricing page.",
  contact_settings: "Singleton contact page hero, copy, email, and form labels. The lowest-ID row is canonical.",
  contact_form_fields: "Fields rendered in the contact form.",
  page_sections: "Editorial copy, section labels, and page-level SEO. Hiding a row restores the built-in fallback copy for that section. Case-study, service-detail, and insight-detail SEO comes from each published record.",
};
