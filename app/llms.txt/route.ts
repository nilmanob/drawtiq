import { getGlobalSettings, getPricingFaqs, getPricingPlans } from "@/lib/content/cms";
import { getPublishedPosts, getPublishedServices } from "@/lib/content/data";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

// llms.txt (https://llmstxt.org): a plain-language map of the site for AI
// answer engines. Built from the same published CMS content as the pages.
export const revalidate = 3600;

const DEFAULT_DESCRIPTION =
  "Drawtiq is an independent design studio for digital products and brand identities that need to work in the real world.";

function clean(value: string | null | undefined) {
  return (value ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function usd(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export async function GET() {
  const [{ data: settings }, { data: services }, { data: plans }, { data: faqs }, { data: posts }] =
    await Promise.all([
      getGlobalSettings(),
      getPublishedServices(),
      getPricingPlans(),
      getPricingFaqs(),
      getPublishedPosts(),
    ]);

  const email = settings?.contact_email || "contact@drawtiq.com";
  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${clean(settings?.seo_description) || DEFAULT_DESCRIPTION}`,
    "",
    `${SITE_NAME} designs UI/UX and digital products, brand identities, graphic design, motion design, and video for small teams and growing companies. Work is offered as monthly design plans or fixed-scope projects. New business: ${email}.`,
    "",
    "## Main pages",
    `- [Home](${absoluteUrl("/")}): Studio overview, selected work, services, and process.`,
    `- [Work](${absoluteUrl("/work")}): Portfolio and case studies.`,
    `- [Services](${absoluteUrl("/services")}): What the studio designs and how engagements work.`,
    `- [Pricing](${absoluteUrl("/pricing")}): Monthly plans, add-ons, and pricing questions.`,
    `- [About](${absoluteUrl("/about")}): The studio, its values, and disciplines.`,
    `- [Insights](${absoluteUrl("/insights")}): Studio notes on design and product thinking.`,
    `- [Careers](${absoluteUrl("/careers")}): Open roles and the hiring process.`,
    `- [Contact](${absoluteUrl("/contact")}): Start a project.`,
  ];

  if (services?.length) {
    lines.push("", "## Services");
    for (const service of services) {
      const summary = clean(service.blurb || service.intro);
      lines.push(`- [${clean(service.title)}](${absoluteUrl(service.detailPath)})${summary ? `: ${summary}` : ""}`);
    }
  }

  const visiblePlans = (plans ?? []).filter((plan) => plan.monthly_price > 0);
  if (visiblePlans.length) {
    lines.push("", "## Pricing (USD, indicative starting points)");
    for (const plan of visiblePlans) {
      const tagline = clean(plan.tagline);
      lines.push(`- ${clean(plan.name)}: ${usd(plan.monthly_price)} per month${tagline ? ` — ${tagline}` : ""}`);
    }
    lines.push(`Details: ${absoluteUrl("/pricing")}`);
  }

  if (faqs?.length) {
    lines.push("", "## Frequently asked questions");
    for (const faq of faqs) {
      lines.push(`### ${clean(faq.question)}`, clean(faq.answer), "");
    }
  }

  if (posts?.length) {
    lines.push("", "## Insights");
    for (const post of posts.slice(0, 10)) {
      lines.push(`- [${clean(post.title)}](${absoluteUrl(`/insights/${post.slug}`)})${post.excerpt ? `: ${clean(post.excerpt)}` : ""}`);
    }
  }

  lines.push("", "## Contact", `- Email: ${email}`, `- Project inquiries: ${absoluteUrl("/contact")}`, "");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
