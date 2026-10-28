import type { ReactNode } from "react";
import Link from "next/link";
import { StudioVisual } from "@/components/studio-visual";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import {
  getContactFormFields,
  getContactSettings,
  getHomepageSections,
  getTestimonials,
  type HomepageSection,
} from "@/lib/content/cms";
import { CONTACT_FIELD_FALLBACKS } from "@/lib/content/contact-fallbacks";
import { getPublishedProjects } from "@/lib/content/data";
import { getPublishedServices } from "@/lib/content/data";
import { getPublishedPosts } from "@/lib/content/data";
import { getServiceIcon, serviceHref } from "@/lib/content/presentation";
import type { PublicService } from "@/lib/content/types";

/**
 * Homepage sections rendered from CMS data with hardcoded fallback.
 *
 * Each section is conditionally rendered: if CMS data exists for that section
 * key, the CMS-driven markup is used; otherwise the original hardcoded markup
 * is rendered. This preserves the existing visual design exactly while making
 * content manageable through the admin panel.
 *
 * All data flows are server-side. Client-side interactivity (GSAP animations,
 * hover effects) is preserved because the DOM structure and classes are
 * identical to the original hardcoded version.
 */

const HERO_FALLBACK = {
  eyebrow: "Independent design studio",
  heading:
    'Make it <span class="headline-outline">meaningful.</span><br />Make it <em>move.</em>',
  intro:
    "We help small teams turn complicated ideas into products and brands that feel simple to use.",
  ctaPrimary: { label: "Start a project", href: "/contact" },
  ctaSecondary: { label: "Explore selected work", href: "/work" },
  footnote: "No big brief needed. A sentence is enough.",
  artIndex: "DT—001 / BRAND IN MOTION",
  artSticker: "Ideas<br />into impact",
  floatingUiTop: { label: "Concept / 04", value: "Clarity, by design." },
  floatingUiBottom: { value: "FORM FOLLOWS FEELING" },
  artCaption: "FIG 01. A SYSTEM OF POSSIBILITY",
};

const TRUST_STRIP_FALLBACK = {
  label: "Good work comes from",
  principles: [
    "Curiosity",
    "Plain talk",
    "Good questions",
    "Strong opinions",
    "Loose grip",
    "Real deadlines",
    "Care",
    "Follow-through",
  ],
};

const WORK_FALLBACK = {
  eyebrow: "01 / Selected work",
  heading: "Thoughtful work.<br /><em>Made to be used.</em>",
  cta: { label: "Have a project in mind?", href: "#contact" },
  bottomCta: { label: "Let's make yours next", href: "#contact" },
  featuredProjects: ["northstar", "bloomwell", "form-object", "orbit"],
};

const SERVICES_FALLBACK = {
  eyebrow: "02 / What we do",
  heading: "Good thinking.<br /><em>Made useful.</em>",
  note: "Strategy, design, and build. One team from first sketch to final pixel.",
  footerNote: {
    drawn: "Small details. Bigger picture.",
    mono: "STRATEGY × DESIGN × DELIVERY",
  },
  tagsFallback: "Strategy · Design · Delivery",
};

const PROCESS_FALLBACK = {
  eyebrow: "03 / How we work",
  heading: "Clear process.<br /><em>No black boxes.</em>",
  note:
    "A simple process, run collaboratively. You always know what we're doing and why.",
  steps: [
    { index: "01", symbol: "⌕", title: "Discover", body: "We ask a lot of questions, listen properly, and resist the urge to jump to a solution.", label: "LISTEN FIRST" },
    { index: "02", symbol: "⌗", title: "Define", body: "We agree on the problem, the constraints, and what success actually looks like.", label: "FIND THE FOCUS" },
    { index: "03", symbol: "✳", title: "Design", body: "We make, test, throw away, and make again until it feels inevitable.", label: "MAKE IT REAL" },
    { index: "04", symbol: "↗", title: "Deliver", body: "We hand over work your team can use, with the files and context to keep it moving.", label: "BUILT TO MOVE" },
  ],
};

const STUDIO_FALLBACK = {
  eyebrow: "04 / The studio",
  heading: "Not just how it looks.<br /><em>How it works.</em>",
  lead: "We make things that work first, then make them feel good.",
  paragraphs: [
    "We're a small studio. We work directly with founders and product teams, ask a lot of questions, and stay close to the work from first sketch to launch. No handoffs to a mystery team.",
    "No design theatre. No decks that die in a folder. Just clear decisions and work that ships.",
  ],
  values: [
    { index: "01", label: "Curiosity before assumptions" },
    { index: "02", label: "Plain talk over jargon" },
    { index: "03", label: "Care in the details" },
  ],
  linkLabel: "A little about our approach",
  linkHref: "#contact",
  artIndex: "DRAWING NO. 008",
  artCaption: "FORM / FUNCTION / FEELING",
  stamp: "A little<br />more thought<br />goes a long way.",
};

const INSIGHTS_FALLBACK = {
  eyebrow: "06 / Notes from the studio",
  heading: "Notes from<br /><em>the work.</em>",
  cta: { label: "Read all notes", href: "/insights" },
  cardLinkLabel: "Read the note",
  ctaHeading: "Want this thinking on your product?",
  ctaBody: "Tell us what you're working on and we'll bring the questions.",
  ctaLabel: "Start a project",
  ctaHref: "/contact",
  featuredPosts: ["clarity-is-a-feature", "consistency-without-predictability", "the-better-question"],
};

const CONTACT_FALLBACK = {
  eyebrow: "07 / Your turn",
  heading: "Have a good idea?<br /><em>Let's make it work.</em>",
  paragraph: "Tell us what you're working on. We'll reply within two business days with a few honest questions and a clear next step.",
  email: "",
  formHeading: "",
  formSubheading: "",
  submitLabel: "",
  hint: "",
  formNotes: {
    heading: "PROJECT INQUIRY / 001",
    subheading: "A real person reads every note. Usually a reply within two working days.",
    submit: "Send inquiry",
    hint: "We use these details only to reply to your inquiry.",
  },
  fieldNames: ["name", "email", "service", "message"],
};

/**
 * The original homepage import stored the primary headline/eyebrow in the
 * dedicated `title`/`subtitle` columns instead of duplicating them in
 * `content`. Map those columns onto the fields the renderer already uses.
 * Non-empty columns win so editing them in the CMS updates the public page;
 * all other `content` JSON values remain untouched.
 */
const SECTION_TEXT_FIELDS: Record<
  string,
  { title?: string; subtitle?: string }
> = {
  hero: { title: "heading", subtitle: "intro" },
  "trust-strip": { title: "label" },
  "work-section": { title: "heading", subtitle: "eyebrow" },
  "services-section": { title: "heading", subtitle: "eyebrow" },
  "process-section": { title: "heading", subtitle: "eyebrow" },
  "studio-section": { title: "heading", subtitle: "eyebrow" },
  testimonials: { title: "eyebrow" },
  "insights-section": { title: "heading", subtitle: "eyebrow" },
  "contact-section": { title: "heading", subtitle: "eyebrow" },
};

/**
 * The CMS records created before the display markup was preserved hold plain
 * headings. These exact values are the original homepage copy, so restore the
 * emphasis the design relies on without touching the stored content.
 */
const KNOWN_PLAIN_HEADINGS: Record<string, Record<string, string>> = {
  hero: {
    "Make it meaningful.<br />Make it move.":
      'Make it <span class="headline-outline">meaningful.</span><br />Make it <em>move.</em>',
  },
  "work-section": {
    "Thoughtful work.<br />Made to be used.":
      "Thoughtful work.<br /><em>Made to be used.</em>",
  },
  "services-section": {
    "Good thinking.<br />Made useful.":
      "Good thinking.<br /><em>Made useful.</em>",
  },
  "process-section": {
    "Clear process.<br />No black boxes.":
      "Clear process.<br /><em>No black boxes.</em>",
  },
  "studio-section": {
    "Not just how it looks.<br />How it works.":
      "Not just how it looks.<br /><em>How it works.</em>",
  },
  "insights-section": {
    "Notes from<br />the work.": "Notes from<br /><em>the work.</em>",
  },
  "contact-section": {
    "Have a good idea?<br />Let's make it work.":
      "Have a good idea?<br /><em>Let's make it work.</em>",
  },
};

function restoreHeadingMarkup(sectionKey: string, value: string): string {
  const normalized = value
    .replace(/\s*<br\s*\/?>\s*/gi, "<br />")
    .trim();

  if (!normalized) {
    return normalized;
  }

  // Preserve markup supplied by an editor.
  if (/<(?:em|span)\b/i.test(normalized)) {
    return normalized;
  }

  const known = KNOWN_PLAIN_HEADINGS[sectionKey]?.[normalized];
  if (known) {
    return known;
  }

  // Every original section heading emphasises its second line. Keep that
  // behaviour when an editor changes the copy but not the structure.
  if (sectionKey !== "hero" && normalized.includes("<br />")) {
    const [first, ...rest] = normalized.split("<br />");
    return `${first}<br /><em>${rest.join("<br />")}</em>`;
  }

  return normalized;
}

function contentForSection(section: HomepageSection) {
  const content = { ...(section.content ?? {}) };
  const mapping = SECTION_TEXT_FIELDS[section.section_key];

  if (!mapping) return content;

  if (mapping.title && section.title?.trim()) {
    content[mapping.title] = restoreHeadingMarkup(
      section.section_key,
      section.title
    );
  }
  if (mapping.subtitle && section.subtitle?.trim()) {
    content[mapping.subtitle] = section.subtitle;
  }

  return content;
}

function getSection(sections: HomepageSection[], key: string, fallback: any) {
  const found = sections.find((s) => s.section_key === key);
  const merge = (base: any, override: any): any => {
    if (Array.isArray(base)) return Array.isArray(override) ? override : base;
    if (!base || typeof base !== "object") return override ?? base;
    const source = override && typeof override === "object" && !Array.isArray(override) ? override : {};
    return Object.fromEntries(
      Object.entries(base).map(([name, value]) => [name, merge(value, source[name])])
    );
  };
  const merged = found ? merge(fallback, contentForSection(found)) : fallback;
  const mapping = SECTION_TEXT_FIELDS[key];

  if (mapping?.title && typeof merged[mapping.title] === "string") {
    merged[mapping.title] = restoreHeadingMarkup(key, merged[mapping.title]);
  }

  return merged;
}

const HOMEPAGE_ORDER = [
  "hero", "trust-strip", "work-section", "services-section", "process-section",
  "studio-section", "testimonials", "insights-section", "contact-section",
] as const;

const HOMEPAGE_COMPONENTS: Record<string, () => Promise<any>> = {
  hero: HomepageHero,
  "trust-strip": HomepageTrustStrip,
  "work-section": HomepageWorkSection,
  "services-section": HomepageServicesSection,
  "process-section": HomepageProcessSection,
  "studio-section": HomepageStudioSection,
  testimonials: HomepageTestimonials,
  "insights-section": HomepageInsightsSection,
  "contact-section": HomepageContactSection,
};

/**
 * Renders homepage sections in CMS order. When the CMS has published
 * homepage_sections rows, only those visible keys render, so records can be
 * reordered or hidden. With no CMS rows, the original full fallback page
 * renders unchanged.
 */
export async function HomepageContent() {
  const { data: sections, source } = await getHomepageSections();
  const cmsKeys = sections.map((section) => section.section_key);
  const keys = source === "database" && cmsKeys.length ? cmsKeys : [...HOMEPAGE_ORDER];

  return (
    <>
      {keys.map((key) => {
        const Component = HOMEPAGE_COMPONENTS[key];
        return Component ? <Component key={key} /> : null;
      })}
    </>
  );
}

/**
 * The CMS display copy intentionally supports a very small markup vocabulary:
 * line breaks, emphasis, and the outlined hero word. Parse only those tags so
 * arbitrary HTML from a CMS record is rendered as text.
 */
const RICH_TEXT_TOKEN =
  /(<br\s*\/?>|<\/?em\s*>|<\/?span(?:\s+class=["']headline-outline["'])?\s*>)/gi;

function RichText({ value }: { value: string | null | undefined }) {
  const markup = value || "";
  const nodes: ReactNode[] = [];
  const stack: Array<"em" | "outline"> = [];

  const parts = markup.split(RICH_TEXT_TOKEN);

  parts.forEach((part, index) => {
    if (!part) return;

    if (/^<br\s*\/?>$/i.test(part)) {
      nodes.push(<br key={`br-${index}`} />);
      return;
    }

    if (/^<em\s*>$/i.test(part)) {
      stack.push("em");
      return;
    }

    if (/^<\/em\s*>$/i.test(part)) {
      if (stack[stack.length - 1] === "em") stack.pop();
      return;
    }

    if (/^<span\b/i.test(part)) {
      stack.push("outline");
      return;
    }

    if (/^<\/span\s*>$/i.test(part)) {
      const outlineIndex = stack.lastIndexOf("outline");
      if (outlineIndex !== -1) stack.splice(outlineIndex, 1);
      return;
    }

    let node: ReactNode = part;

    for (let depth = stack.length - 1; depth >= 0; depth -= 1) {
      node =
        stack[depth] === "em" ? (
          <em key={`em-${index}-${depth}`}>{node}</em>
        ) : (
          <span key={`outline-${index}-${depth}`} className="headline-outline">
            {node}
          </span>
        );
    }

    nodes.push(node);
  });

  return <>{nodes}</>;
}

export async function HomepageHero() {
  const { data: sections } = await getHomepageSections();
  const content = getSection(sections || [], "hero", HERO_FALLBACK);

  return (
    <section className="hero section-wrap">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="status-dot"></span>
          {content.eyebrow}
        </p>
        <h1><RichText value={content.heading} /></h1>
        <p className="hero-intro">{content.intro}</p>
        <div className="hero-actions">
          <Link href={content.ctaPrimary.href} className="button button-dark">
            {content.ctaPrimary.label} <span>↗</span>
          </Link>
          <Link href={content.ctaSecondary.href} className="text-link">
            {content.ctaSecondary.label} <span>↗</span>
          </Link>
        </div>
        <p className="hero-footnote">
          <svg className="hand-arrow" viewBox="0 0 44 18" aria-hidden="true">
            <path d="M1 13c10 0 18-8 32-8" />
            <path d="m28 1 6 4-6 4" />
          </svg>
          {content.footnote}
        </p>
      </div>
      <div className="hero-art" aria-label="Abstract Drawtiq design system illustration">
        <div className="art-index mono">{content.artIndex}</div>
        <div className="art-grid"></div>
        <div className="art-orbit orbit-one"></div>
        <div className="art-orbit orbit-two"></div>
        <svg
          className="drawn-mark"
          viewBox="0 0 500 470"
          role="img"
          aria-label="Drawn geometric D symbol"
        >
          <path
            className="draw-path"
            d="M128 90 C220 24 350 83 365 190 C385 308 282 386 174 354 C73 324 47 207 102 124 C160 39 289 63 327 145 C366 231 302 315 224 313 C153 311 112 253 133 194 C152 140 211 122 260 153"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M250 72 L250 356 M108 215 L386 215"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 8"
            opacity=".3"
          />
        </svg>
        <div className="art-sticker"><RichText value={content.artSticker} /></div>
        <div className="floating-ui ui-top">
          <span className="mini-dot"></span>
          <span>{content.floatingUiTop.label}</span>
          <b>{content.floatingUiTop.value}</b>
        </div>
        <div className="floating-ui ui-bottom">
          <span className="ui-line"></span>
          <span className="mono">{content.floatingUiBottom.value}</span>
          <span className="ui-arrow">↗</span>
        </div>
        <div className="art-caption mono">{content.artCaption}</div>
      </div>
    </section>
  );
}

export async function HomepageTrustStrip() {
  const { data: sections } = await getHomepageSections();
  const content = getSection(sections || [], "trust-strip", TRUST_STRIP_FALLBACK);

  return (
    <section className="trust-strip section-wrap" aria-label="Studio principles">
      <span className="trust-label">{content.label}</span>
      <div className="trust-marquee">
        <ul className="trust-track">
          {[...content.principles, ...content.principles].map((principle, i) => (
            <li key={`${principle}-${i}`} aria-hidden={i >= content.principles.length ? "true" : undefined}>
              <span aria-hidden="true">✳</span>
              {principle}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export async function HomepageWorkSection() {
  const { data: sections } = await getHomepageSections();
  const { data: projects } = await getPublishedProjects();
  const content = getSection(sections || [], "work-section", WORK_FALLBACK);
  const storedFeaturedSlugs = Array.isArray(content.featuredProjects)
    ? content.featuredProjects.filter((slug: unknown): slug is string => typeof slug === "string")
    : [];
  // An earlier CMS import stored only the two flagged fallback projects. Keep
  // that legacy value from silently removing two of the four original cards.
  const legacyIncompleteSelection =
    storedFeaturedSlugs.length === 2 &&
    storedFeaturedSlugs.includes("northstar") &&
    storedFeaturedSlugs.includes("orbit");
  const featuredSlugs = legacyIncompleteSelection
    ? WORK_FALLBACK.featuredProjects
    : storedFeaturedSlugs;
  const featured = featuredSlugs.length
    ? (projects ?? []).filter((project) => featuredSlugs.includes(project.slug))
    : (projects ?? []).filter((project) => project.featured);

  return (
    <section className="work-section section-wrap section-pad" id="work">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{content.eyebrow}</p>
          <h2><RichText value={content.heading} /></h2>
        </div>
        <Link href={content.cta.href} className="text-link">
          {content.cta.label} <span>↗</span>
        </Link>
      </div>
      <div className="work-grid">
        {featured.map((project) => {
          const kind = project.visualKey.toLowerCase();
          const brand =
            project.visual?.brand ??
            project.title.trim().split(/\s+/)[0]?.toLowerCase() ??
            "project";
          const listNumber = project.visual?.listNumber ?? project.visual?.number ?? "—";
          const isLarge = kind === "fintech" || kind === "orbit" || project.featured;

          return (
            <Link
              key={project.slug}
              className={`project ${isLarge ? "project-large" : "project-small"} reveal`}
              data-category="uiux"
              href={`/case-study/${project.slug}`}
            >
              {kind === "fintech" && (
                <div className="project-visual visual-fintech">
                  <div className="mock-window">
                    <div className="mock-top">
                      <b>{brand}</b>
                      <span>•••</span>
                    </div>
                    <div className="mock-balance">
                      <small>Total balance</small>
                      <strong>{listNumber}</strong>
                      <span className="growth">
                        {project.visual?.growth ?? "↗ 12.8% this month"}
                      </span>
                    </div>
                    <svg viewBox="0 0 500 140" preserveAspectRatio="none">
                      <path
                        d="M0 110 C40 96 45 112 80 76 S130 88 165 53 S230 76 270 38 S330 63 370 24 S435 36 500 8"
                        fill="none"
                        stroke="#c8ff43"
                        strokeWidth="3"
                      />
                    </svg>
                    <div className="mock-bottom">
                      <span>Cash flow</span>
                      <span>Activity</span>
                      <span>Insights</span>
                    </div>
                  </div>
                  <div className="fintech-orb"></div>
                  <span className="visual-label mono">PRODUCT DESIGN / CONCEPT</span>
                </div>
              )}
              {kind === "bloom" && (
                <div className="project-visual visual-bloom">
                  <div className="bloom-card">
                    <span className="bloom-symbol">{project.visual?.number ?? "b."}</span>
                    <span className="bloom-name">{brand}</span>
                    <span className="bloom-sub">{project.summary ?? project.subtitle ?? ""}</span>
                    <div className="bloom-petal petal-a"></div>
                    <div className="bloom-petal petal-b"></div>
                  </div>
                  <span className="visual-label mono">IDENTITY / CONCEPT</span>
                </div>
              )}
              {kind === "form" && (
                <div className="project-visual visual-form">
                  <div className="form-package">
                    <span>{project.visual?.brand ?? project.title.toUpperCase()}</span>
                    <strong>
                      {project.subtitle?.split(" ").slice(0, -1).join(" ") ?? ""}
                      <strong>
                        {project.subtitle?.split(" ").pop() ?? ""}
                      </strong>
                    </strong>
                    <div className="form-circle"></div>
                    <small>{project.visual?.note ?? "Everyday objects, considered."}</small>
                  </div>
                  <span className="visual-label mono">ART DIRECTION / CONCEPT</span>
                </div>
              )}
              {kind === "orbit" && (
                <div className="project-visual visual-orbit">
                  <div className="orbit-panel">
                    <div className="orbit-sidebar">
                      <b>{brand}</b>
                      <span>Overview</span>
                      <span>Projects</span>
                      <span>Reports</span>
                      <span>Settings</span>
                    </div>
                    <div className="orbit-main">
                      <small>MONDAY, OCTOBER 12</small>
                      <h4>Your team, in sync.</h4>
                      <div className="orbit-stats">
                        <div>
                          <small>Active projects</small>
                          <b>{listNumber}</b>
                        </div>
                        <div>
                          <small>Team velocity</small>
                          <b>+24%</b>
                        </div>
                        <div>
                          <small>On track</small>
                          <b>92%</b>
                        </div>
                      </div>
                      <div className="orbit-chart">
                        <i style={{ height: "32%" }}></i>
                        <i style={{ height: "48%" }}></i>
                        <i style={{ height: "39%" }}></i>
                        <i style={{ height: "63%" }}></i>
                        <i style={{ height: "55%" }}></i>
                        <i style={{ height: "78%" }}></i>
                        <i style={{ height: "67%" }}></i>
                        <i style={{ height: "92%" }}></i>
                        <i style={{ height: "72%" }}></i>
                        <i style={{ height: "100%" }}></i>
                      </div>
                    </div>
                  </div>
                  <div className="orbit-shape"></div>
                  <span className="visual-label mono">SAAS / CONCEPT</span>
                </div>
              )}
              {!kind || (kind !== "fintech" && kind !== "bloom" && kind !== "form" && kind !== "orbit") && (
                <div className="project-visual visual-form">
                  <div className="form-package">
                    <span>{project.visual?.brand ?? project.title.toUpperCase()}</span>
                    <strong>
                      {project.subtitle?.split(" ").slice(0, -1).join(" ") ?? ""}
                      <strong>{project.subtitle?.split(" ").pop() ?? ""}</strong>
                    </strong>
                    <div className="form-circle"></div>
                    <small>{project.visual?.note ?? "Everyday objects, considered."}</small>
                  </div>
                  <span className="visual-label mono">ART DIRECTION / CONCEPT</span>
                </div>
              )}
              <div className="project-meta">
                <div>
                  <p className="eyebrow">
                    {project.industry} · {project.discipline?.split("·")[0]?.trim() ?? "Project"}
                  </p>
                  <h3>{project.title}</h3>
                  <p>{project.summary ?? project.subtitle ?? ""}</p>
                </div>
                <span className="round-arrow">↗</span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="work-bottom">
        <a href={content.bottomCta.href} className="text-link">
          {content.bottomCta.label} <span>↗</span>
        </a>
      </div>
    </section>
  );
}

export async function HomepageServicesSection() {
  const { data: sections } = await getHomepageSections();
  const { data: services } = await getPublishedServices();
  const content = getSection(sections || [], "services-section", SERVICES_FALLBACK);

  const serviceList = (services?.length ? services : []) as PublicService[];

  return (
    <section className="services-section section-wrap" id="services">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{content.eyebrow}</p>
          <h2><RichText value={content.heading} /></h2>
        </div>
        <p className="heading-note">{content.note}</p>
      </div>
      <div className="service-list">
        {serviceList.map((service: PublicService, i: number) => {
          const icon = getServiceIcon(service.icon);
          return (
            <Link
              key={service.slug || i}
              href={serviceHref(service)}
              className="service-row reveal"
              data-preview={service.previewPath}
            >
              <span className="service-number mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={`service-icon ${icon.className}`}>{icon.glyph}</div>
              <div className="service-title">
                <h3>{service.title}</h3>
                <p>{service.blurb ?? ""}</p>
              </div>
              <div className="service-detail">
                {service.tags.length ? service.tags.join(" · ") : content.tagsFallback}
              </div>
              <span className="service-arrow">↗</span>
            </Link>
          );
        })}
      </div>
      <div className="service-note">
        <span className="drawn-underline">{content.footerNote.drawn}</span>
        <span className="mono">{content.footerNote.mono}</span>
      </div>
    </section>
  );
}

export async function HomepageProcessSection() {
  const { data: sections } = await getHomepageSections();
  const content = getSection(sections || [], "process-section", PROCESS_FALLBACK);

  return (
    <section className="process-section section-wrap section-pad">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{content.eyebrow}</p>
          <h2><RichText value={content.heading} /></h2>
        </div>
        <p className="heading-note">{content.note}</p>
      </div>
      <div className="process-track">
        <div className="process-line"><span></span></div>
        {content.steps.map((step: any, i: number) => (
          <article key={step.index} className="process-step reveal">
            <span className="step-index">{step.index}</span>
            <div className="step-symbol">{step.symbol}</div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <span className="mono">{step.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export async function HomepageStudioSection() {
  const { data: sections } = await getHomepageSections();
  const content = getSection(sections || [], "studio-section", STUDIO_FALLBACK);

  return (
    <section className="studio-section" id="studio">
      <div className="section-wrap studio-grid">
        <div className="studio-art">
          <div className="studio-paper">
            <span className="mono">{content.artIndex}</span>
            <StudioVisual />
            <span className="mono">{content.artCaption}</span>
          </div>
          <div className="studio-stamp">
            <RichText value={content.stamp} />
          </div>
        </div>
        <div className="studio-copy">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2><RichText value={content.heading} /></h2>
          <p className="studio-lead">{content.lead}</p>
          {content.paragraphs.map((p: any, i: number) => (
            <p key={i}>{p}</p>
          ))}
          <a href={content.linkHref} className="text-link">
            {content.linkLabel} <span>↗</span>
          </a>
          <div className="studio-values">
            {content.values.map((v: any, i: number) => (
              <div key={v.index}>
                <b>{v.index.split(" ")[0]}</b>
                <span>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export async function HomepageTestimonials() {
  const [{ data: sections }, { data: testimonials }] = await Promise.all([
    getHomepageSections(),
    getTestimonials(),
  ]);
  const content = getSection(sections || [], "testimonials", {
    eyebrow: "05 / What we aim for",
    attribution: "Studio note · Drawtiq",
    note: "A small studio manifesto, not invented client feedback.",
    items: [
      { number: "01", label: "Clarity", quote: "Make the complicated feel obvious. Then make it feel good.", emphasis: "obvious." },
      { number: "02", label: "Questions", quote: "Ask the question behind the brief. The answer usually gets simpler.", emphasis: "behind the brief." },
      { number: "03", label: "Shipping", quote: "Ship the thing. A good deck is not the work.", emphasis: "Ship the thing." },
      { number: "04", label: "Handover", quote: "Leave the team with something they can use without us.", emphasis: "without us." },
      { number: "05", label: "Details", quote: "Care about the details, but don't confuse them with the point.", emphasis: "the point." },
    ],
  });

  return (
    <TestimonialCarousel
      eyebrow={content.eyebrow}
      attribution={content.attribution}
      items={
        testimonials.length
          ? testimonials.map((item, index) => ({
              quote: item.quote,
              emphasis: item.emphasis || item.quote,
              number: item.number || String(index + 1).padStart(2, "0"),
              label: item.label || "Studio note",
            }))
          : content.items
      }
    />
  );
}

export async function HomepageInsightsSection() {
  const { data: sections } = await getHomepageSections();
  const { data: posts } = await getPublishedPosts();
  const content = getSection(sections || [], "insights-section", INSIGHTS_FALLBACK);

  const featuredSlugs = Array.isArray(content.featuredPosts)
    ? content.featuredPosts.filter((slug: unknown): slug is string => typeof slug === "string")
    : [];
  const insightPosts = featuredSlugs.length
    ? (posts ?? []).filter((post) => featuredSlugs.includes(post.slug))
    : posts ?? [];

  return (
    <section className="insights-section section-wrap section-pad" id="insights">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{content.eyebrow}</p>
          <h2><RichText value={content.heading} /></h2>
        </div>
        <Link href={content.cta.href} className="text-link">
          {content.cta.label} <span>↗</span>
        </Link>
      </div>
      <div className="insight-grid">
        {insightPosts.map((post) => (
          <Link key={post.slug} href={`/insights/${post.slug}`} className="insight-card reveal">
            <div className={`insight-visual insight-${post.visual}`}>
              <span className="mono">{post.label}</span>
              {post.visual === "one" && <span className="insight-shape"></span>}
              <div className="note-visual-copy"><RichText value={post.display} /></div>
            </div>
            <div className="insight-meta">
              <span>{post.category}</span>
              <span>{post.readTime}</span>
            </div>
            <h3>{post.title}</h3>
            <span className="insight-link">{content.cardLinkLabel} ↗</span>
          </Link>
        ))}
      </div>
      <div className="page-cta">
        <div>
          <h2>{content.ctaHeading}</h2>
          <p>{content.ctaBody}</p>
        </div>
        <Link href={content.ctaHref} className="button button-dark">
          {content.ctaLabel} <span>↗</span>
        </Link>
      </div>
    </section>
  );
}

export async function HomepageContactSection() {
  const [{ data: sections }, { data: settings }, { data: configuredFields }] = await Promise.all([
    getHomepageSections(),
    getContactSettings(),
    getContactFormFields(),
  ]);
  const content = getSection(sections || [], "contact-section", CONTACT_FALLBACK);
  const fields = configuredFields.length ? configuredFields : CONTACT_FIELD_FALLBACKS;
  const fieldNames = Array.isArray(content.fieldNames)
    ? content.fieldNames.filter((name: unknown): name is string => typeof name === "string")
    : [];
  const homepageFields = fieldNames.length
    ? fields.filter((field) => fieldNames.includes(field.field_name))
    : fields;
  const formHeading = content.formHeading || settings?.form_heading || content.formNotes.heading;
  const formSubheading = content.formSubheading || settings?.form_subheading || content.formNotes.subheading;
  const submitLabel = content.submitLabel || settings?.submit_label || content.formNotes.submit;
  const hint = content.hint || settings?.hint_text || content.formNotes.hint;

  return (
    <section className="contact-section" id="contact">
      <div className="section-wrap contact-grid">
        <div className="contact-copy">
          <p className="eyebrow">
            <span className="status-dot"></span>
            {content.eyebrow}
          </p>
          <h2><RichText value={content.heading} /></h2>
          <p>{content.paragraph}</p>
          <a className="contact-email" href={`mailto:${content.email || settings?.email_address || "hello@drawtiq.studio"}`}>
            {content.email || settings?.email_address || "hello@drawtiq.studio"} <span>↗</span>
          </a>
        </div>
        <form className="contact-form" id="project-form" method="post" action="/api/inquiries">
          <div aria-hidden="true" style={{ position: "absolute", left: "-10000", width: "1px", height: "1px", overflow: "hidden" }}>
            <label>
              Website<input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="form-heading">
            <span className="mono">{formHeading}</span>
            <span>{formSubheading}</span>
          </div>
          {homepageFields.map((field) => (
            <HomepageContactField key={field.id} field={field} />
          ))}
          <button className="button button-accent form-submit" type="submit">
            {submitLabel} <span>↗</span>
          </button>
          <p className="form-hint" id="form-hint" role="status" aria-live="polite">
            {hint}
          </p>
        </form>
      </div>
    </section>
  );
}

function HomepageContactField({ field }: { field: (typeof CONTACT_FIELD_FALLBACKS)[number] }) {
  const options = field.options.filter((option): option is string => typeof option === "string");
  const required = field.is_required;

  return (
    <label>
      {field.field_label}
      {field.field_type === "textarea" ? (
        <textarea
          name={field.field_name}
          rows={3}
          placeholder={field.placeholder || undefined}
          required={required}
        />
      ) : field.field_type === "select" ? (
        <select name={field.field_name} required={required} defaultValue="">
          <option value="" disabled={required}>{field.placeholder || "Select an option"}</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          name={field.field_name}
          type={field.field_type}
          autoComplete={field.field_name === "name" ? "name" : field.field_name === "email" ? "email" : undefined}
          placeholder={field.placeholder || undefined}
          required={required}
          accept={field.field_type === "file" ? ".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" : undefined}
        />
      )}
    </label>
  );
}
