import type { FooterSocial, GlobalSettings } from "@/lib/content/cms";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";

type JsonLdObject = Record<string, unknown>;

/**
 * schema.org structured data for search engines and AI answer engines.
 * Rendered server-side; "<" is escaped so CMS text can never close the tag.
 */
export function JsonLd({
  data,
}: {
  data: JsonLdObject | null | Array<JsonLdObject | null>;
}) {
  const items = (Array.isArray(data) ? data : [data]).filter(
    (item): item is JsonLdObject => Boolean(item)
  );
  if (items.length === 0) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(items.length === 1 ? items[0] : items).replace(/</g, "\\u003c"),
      }}
    />
  );
}

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const DEFAULT_DESCRIPTION =
  "Drawtiq is an independent design studio for digital products and brand identities that need to work in the real world.";

export function organizationJsonLd(
  settings: GlobalSettings | null | undefined,
  social: FooterSocial[] | null | undefined
): JsonLdObject {
  const email = settings?.contact_email || "contact@drawtiq.com";
  const sameAs = (social ?? [])
    .map((link) => link.href)
    .filter((href) => /^https?:\/\//i.test(href) && !href.includes(new URL(SITE_URL).host));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: settings?.copyright_holder || "Drawtiq Studio",
    url: SITE_URL,
    logo: absoluteUrl(settings?.logo_path || "/assets/Drawtiq-logo.png"),
    description: settings?.seo_description || DEFAULT_DESCRIPTION,
    email,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "new business",
      email,
      url: absoluteUrl("/contact"),
      availableLanguage: ["English"],
    },
    knowsAbout: [
      "UI/UX design",
      "Product design",
      "Brand identity",
      "Graphic design",
      "Motion design",
      "Video editing",
      "Website design",
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd(settings: GlobalSettings | null | undefined): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: settings?.seo_description || DEFAULT_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** FAQ rich results and a direct source for answer engines. */
export function faqJsonLd(items: Array<{ question: string; answer: string }>): JsonLdObject | null {
  const valid = items.filter((item) => item.question?.trim() && item.answer?.trim());
  if (valid.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: valid.map((item) => ({
      "@type": "Question",
      name: stripHtml(item.question),
      acceptedAnswer: { "@type": "Answer", text: stripHtml(item.answer) },
    })),
  };
}

export function articleJsonLd(post: {
  slug: string;
  title: string;
  excerpt?: string | null;
  date?: string | null;
  category?: string | null;
}): JsonLdObject {
  const url = absoluteUrl(`/insights/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: stripHtml(post.title),
    description: post.excerpt ? stripHtml(post.excerpt) : undefined,
    url,
    mainEntityOfPage: url,
    ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
    ...(post.category ? { articleSection: post.category } : {}),
    inLanguage: "en",
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    image: absoluteUrl("/opengraph-image"),
  };
}

export function serviceJsonLd(service: {
  name: string;
  description?: string | null;
  path: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: stripHtml(service.name),
    serviceType: stripHtml(service.name),
    description: service.description ? stripHtml(service.description) : undefined,
    url: absoluteUrl(service.path),
    provider: { "@id": ORGANIZATION_ID },
    areaServed: "Worldwide",
  };
}

export function caseStudyJsonLd(project: {
  slug: string;
  title: string;
  description?: string | null;
  category?: string | null;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: stripHtml(project.title),
    description: project.description ? stripHtml(project.description) : undefined,
    url: absoluteUrl(`/case-study/${project.slug}`),
    ...(project.category ? { genre: project.category } : {}),
    creator: { "@id": ORGANIZATION_ID },
  };
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
