import type { CmsTable } from "../cms/config";

export type PageCollectionLink = {
  table: "projects" | "services" | "blog_posts";
  href: string;
  label: string;
  description: string;
};

export type PageSectionGroup = {
  table: CmsTable;
  title: string;
  description: string;
  /** For page_sections: which page_key rows belong on this screen. */
  pageKey?: string;
};

export type WebsitePage = {
  key: string;
  label: string;
  publicHref: string;
  description: string;
  sections: PageSectionGroup[];
  collections?: PageCollectionLink[];
};

const projects: PageCollectionLink = {
  table: "projects",
  href: "/admin/projects",
  label: "Projects",
  description: "Portfolio pieces and case studies. Published projects appear on Work and as case studies.",
};

const services: PageCollectionLink = {
  table: "services",
  href: "/admin/services",
  label: "Services",
  description: "Service records used by the services list and the service detail pages.",
};

const posts: PageCollectionLink = {
  table: "blog_posts",
  href: "/admin/posts",
  label: "Blog posts",
  description: "Insights articles. Published posts appear on the Insights page.",
};

function copy(
  pageKey: string,
  description: string,
  title = "Page copy & SEO"
): PageSectionGroup {
  return { table: "page_sections", pageKey, title, description };
}

/**
 * Every main public page and the existing CMS records that feed it. Each
 * screen reuses the shared collection table and record editor; nothing here
 * creates a second content store.
 */
export const WEBSITE_PAGES: WebsitePage[] = [
  {
    key: "homepage",
    label: "Homepage",
    publicHref: "/",
    description: "Hero, trust strip, featured work, services, process, studio, testimonials, insights, and contact sections.",
    sections: [
      {
        table: "homepage_sections",
        title: "Homepage sections",
        description: "Each visible section renders in order. Hide a section to remove it from the homepage.",
      },
      {
        table: "testimonials",
        title: "Testimonials",
        description: "Quotes in the homepage testimonial carousel.",
      },
      copy("homepage", "Homepage search title and description."),
    ],
    collections: [projects, services, posts],
  },
  {
    key: "work",
    label: "Work / Portfolio",
    publicHref: "/work",
    description: "Portfolio archive: hero, filters, and closing call to action. The project grid comes from Projects.",
    sections: [copy("work", "Hero, filter labels, call to action, and SEO for the Work page.")],
    collections: [projects],
  },
  {
    key: "case-studies",
    label: "Case Studies",
    publicHref: "/case-study",
    description: "Shared labels used on every case study page. Each case study's content and SEO come from its project record.",
    sections: [copy("case-studies", "Labels shared by all case study pages.", "Shared case study labels")],
    collections: [projects],
  },
  {
    key: "services",
    label: "Services",
    publicHref: "/services",
    description: "Services overview copy, engagement panels, and the shared service detail labels.",
    sections: [
      copy("services", "Hero, note, engagement panels, list, call to action, and SEO for the Services page."),
      copy("service-details", "Labels shared by the service detail pages.", "Service detail labels"),
    ],
    collections: [services],
  },
  {
    key: "about",
    label: "About",
    publicHref: "/about",
    description: "Studio story, values, and the public team section.",
    sections: [
      {
        table: "about_sections",
        title: "About sections",
        description: "Hero, point of view, values, team, and call to action copy.",
      },
      {
        table: "about_values",
        title: "Values",
        description: "Belief cards on the About page.",
      },
      {
        table: "team_members",
        title: "Public team & disciplines",
        description: "Shown on the About page. This is website content, not admin access; manage admin users under Team & Access.",
      },
      copy("about", "About page search title and description."),
    ],
  },
  {
    key: "pricing",
    label: "Pricing",
    publicHref: "/pricing",
    description: "Plans, features, add-ons, engagement models, and pricing FAQs.",
    sections: [
      { table: "pricing_plans", title: "Plans", description: "Plan names, prices, CTA labels, and featured state." },
      { table: "pricing_plan_features", title: "Plan features", description: "Features listed inside each plan." },
      { table: "pricing_included_features", title: "Included in every plan", description: "Features shared by all plans." },
      { table: "pricing_addons", title: "Add-ons", description: "Optional add-on services." },
      { table: "pricing_engagement_models", title: "Ways to work", description: "Engagement model panels." },
      { table: "pricing_faqs", title: "Pricing FAQs", description: "Questions and answers on the Pricing page." },
      copy("pricing", "Section labels and SEO for the Pricing page."),
    ],
  },
  {
    key: "careers",
    label: "Careers",
    publicHref: "/careers",
    description: "Open roles, perks, hiring steps, and careers FAQs.",
    sections: [
      { table: "careers_roles", title: "Open roles", description: "Roles listed on the Careers page." },
      { table: "careers_perks", title: "Perks", description: "Benefits and ways of working." },
      { table: "careers_process", title: "Hiring steps", description: "The hiring process, in order." },
      { table: "careers_faqs", title: "Careers FAQs", description: "Questions and answers on the Careers page." },
      copy("careers", "Hero, section copy, call to action, and SEO for the Careers page."),
    ],
  },
  {
    key: "insights",
    label: "Insights / Blog",
    publicHref: "/insights",
    description: "Insights index copy and shared article labels. Articles come from Blog posts.",
    sections: [
      copy("insights", "Hero, list, call to action, and SEO for the Insights page."),
      copy("insights-detail", "Labels shared by every article page.", "Article page labels"),
    ],
    collections: [posts],
  },
  {
    key: "contact",
    label: "Contact",
    publicHref: "/contact",
    description: "Contact page copy, email, and the inquiry form fields.",
    sections: [
      { table: "contact_settings", title: "Contact page settings", description: "Hero, copy, email, and form labels." },
      { table: "contact_form_fields", title: "Form fields", description: "Fields in the contact form, in order." },
      copy("contact", "Next steps copy and SEO for the Contact page."),
    ],
  },
];

export function getWebsitePage(key: string) {
  return WEBSITE_PAGES.find((page) => page.key === key);
}
