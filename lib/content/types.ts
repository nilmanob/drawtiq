export type ContentSource = "database" | "fallback" | "mixed";

export type ContentResult<T> = {
  data: T;
  source: ContentSource;
  error: string | null;
};

export type ProjectVisualMeta = {
  brand?: string;
  number?: string;
  listNumber?: string;
  growth?: string;
  note?: string;
  listLabel?: string;
  detailLabel?: string;
  listEyebrow?: string;
};

export type PublicProject = {
  slug: string;
  title: string;
  subtitle: string | null;
  lead: string | null;
  summary: string | null;
  category: string | null;
  discipline: string | null;
  industry: string | null;
  scope: string | null;
  challenge: string | null;
  approach: string | null;
  solution: string | null;
  outcome: string | null;
  visualKey: string;
  featured: boolean;
  sortOrder: number;
  gallery: unknown[];
  seoTitle: string | null;
  seoDescription: string | null;
  visual?: ProjectVisualMeta;
};

export type PublicDeliverable = {
  title: string;
  body: string;
};

export type PublicFaq = {
  q: string;
  a: string;
};

export type PublicService = {
  slug: string;
  title: string;
  blurb: string | null;
  intro: string | null;
  icon: string | null;
  previewPath: string | null;
  tags: string[];
  deliverables: PublicDeliverable[];
  faqs: PublicFaq[];
  sortOrder: number;
  detailPath: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type ServiceCta = {
  heading: string;
  body: string;
  href: string;
  label: string;
};

export type ServiceDetailFallback = {
  routeSlug: string;
  serviceSlugs: string[];
  number: string;
  heroTitle: string;
  lead: string;
  introHeadingPrefix: string;
  introHeadingEmphasis: string;
  introParagraphs: string[];
  sectionLabel: string;
  deliverables: PublicDeliverable[];
  faqs: PublicFaq[];
  pair: Array<{ number: string; title: string; body: string }>;
  cta: ServiceCta;
  exploreHref: string;
  exploreLabel: string;
  visual: "motion" | "video" | null;
  seoTitle: string;
  seoDescription: string;
};

export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export type PublicPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  visual: "one" | "two" | "three" | "four" | "five";
  label: string;
  display: string;
  body: PostBlock[];
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
};
