import Link from "next/link";
import { Faq } from "@/components/faq";
import { PricingPlans } from "@/components/pricing-plans";
import {
  getPricingAddons,
  getPricingEngagementModels,
  getPricingFaqs,
  getPricingIncludedFeatures,
  getPricingPlanFeatures,
  getPricingPlans,
} from "@/lib/content/cms";
import { pageContent, getPageSeo } from "@/lib/content/page-content";
import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { breadcrumbJsonLd, faqJsonLd, JsonLd } from "@/components/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("pricing");
  return pageSeo({
    title: seo.title || "Pricing",
    description:
      seo.description ||
      "Transparent monthly design plans for UI/UX, brand identity, graphic design, motion design, and video editing by Drawtiq.",
    alternates: { canonical: "/pricing" },
  });
}

const included = [
  "A dedicated design lead",
  "Weekly progress updates",
  "Async collaboration in your tools",
  "Organized design files & handoff",
  "Motion-ready components",
  "No lock-in contracts",
];

const models = [
  {
    n: "01",
    title: "Subscribe",
    body: "A rolling monthly plan for teams that need a consistent design partner. Pause or cancel whenever priorities change.",
  },
  {
    n: "02",
    title: "One-off project",
    body: "A fixed brief, a fixed scope, a fixed price. Ideal for a launch, a rebrand, or a specific product problem.",
  },
  {
    n: "03",
    title: "Full partnership",
    body: "An embedded studio for ambitious roadmaps — strategy, design, motion, and video under one roof.",
  },
];

const addons = [
  { title: "Brand sprint", price: "from $3,900", note: "Positioning, identity direction, and core assets in four weeks." },
  { title: "Website design & build", price: "from $6,500", note: "Design, motion, and a fast, accessible front-end build." },
  { title: "Motion pack", price: "from $1,800", note: "A set of animated brand or product moments, ready to ship." },
  { title: "Video edit", price: "from $1,200", note: "Story-first edit with colour, sound, and social cutdowns." },
];

const faqs = [
  {
    q: "How does the monthly model actually work?",
    a: "You start with a shared request list. We work through it in priority order, one or two items at a time, and update you as each lands. There is no hourly tracking and no surprise invoices.",
  },
  {
    q: "Can I change plan later?",
    a: "Yes. Plans are designed to flex. Upgrade when a big push arrives, and move down or pause when things are quiet — with a little notice before the next cycle.",
  },
  {
    q: "Do you offer one-off project pricing?",
    a: "We do. Tell us the scope and outcome you have in mind and we will send a fixed-price proposal with clear milestones.",
  },
  {
    q: "Are the listed prices final?",
    a: "They are honest starting points, not quotes. Final pricing depends on scope, timelines, and the mix of services — we confirm everything before any work begins.",
  },
];

export default async function PricingPage() {
  const [plansResult, featuresResult, includedResult, modelsResult, addonsResult, faqsResult, copy] = await Promise.all([
    getPricingPlans(), getPricingPlanFeatures(), getPricingIncludedFeatures(),
    getPricingEngagementModels(), getPricingAddons(), getPricingFaqs(),
    pageContent("pricing", "copy", { eyebrow: "07 / Pricing", heading: "Simple pricing.<br /><em>No surprises.</em>", lead: "One monthly rate. No timesheets. A team that already knows the work. Choose the pace that fits what you're building.", includedEyebrow: "Every plan includes", modelsEyebrow: "Ways to work together", modelsHeading: "Choose your<br /><em>way in.</em>", modelsNote: "Plans and projects are built on the same process and the same care. Only the pace changes.", addonsEyebrow: "Add-ons", addonsHeading: "One-off <em>extras.</em>", addonsNote: "Standalone engagements you can add to any plan, or book on their own.", faqEyebrow: "A few common questions", faqHeading: "Good to <em>know.</em>", ctaHeading: "Not sure which plan fits?", ctaBody: "Tell us about the work. We'll recommend the simplest way to start.", ctaLabel: "Let's talk", ctaHref: "/contact", disclaimer: "Prices are shown in USD and are indicative starting points for planning, not a formal quote.", planLabels: { monthly: "Monthly", quarterly: "Quarterly", quarterlySave: "save 15%", featured: "Most popular", perMonth: "/ month", monthlyNote: "Rolling monthly · cancel anytime", quarterlyNote: "Billed quarterly · pause anytime", ctaHref: "/contact" } }),
  ]);
  const includedItems = includedResult.data.length ? includedResult.data.map((item) => item.feature_text) : included;
  const engagementModels = modelsResult.data.length
    ? modelsResult.data.map((item) => ({ n: item.number, title: item.title, body: item.body })) : models;
  const addonItems = addonsResult.data.length ? addonsResult.data : addons;
  const faqItems = faqsResult.data.length
    ? faqsResult.data.map((item) => ({ q: item.question, a: item.answer })) : faqs;
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          {copy.eyebrow}
        </p>
         <h1 dangerouslySetInnerHTML={{ __html: copy.heading }} />
        <p className="lead">
          {copy.lead}
        </p>
      </section>

      <section className="page-content section-wrap">
         <PricingPlans cmsPlans={plansResult.data} cmsFeatures={featuresResult.data} labels={copy.planLabels} />

        <div className="pricing-included">
          <p className="eyebrow">{copy.includedEyebrow}</p>
          <div className="included-grid">
            {includedItems.map((item) => (
              <div className="included-item" key={item}>
                <span aria-hidden="true">✳</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="section-heading" style={{ marginTop: "110px" }}>
          <div>
            <p className="eyebrow">{copy.modelsEyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: copy.modelsHeading }} />
          </div>
          <p className="heading-note">
            {copy.modelsNote}
          </p>
        </div>

        <div className="value-grid value-grid-3">
          {engagementModels.map((model) => (
            <article className="value-card" key={model.n}>
              <span className="mono">{model.n}</span>
              <h3>{model.title}</h3>
              <p>{model.body}</p>
            </article>
          ))}
        </div>

        <div className="section-heading" style={{ marginTop: "110px" }}>
          <div>
            <p className="eyebrow">{copy.addonsEyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: copy.addonsHeading }} />
          </div>
          <p className="heading-note">{copy.addonsNote}</p>
        </div>

        <div className="addon-list">
          {addonItems.map((addon) => (
            <div className="addon-row" key={addon.title}>
              <div>
                <h3>{addon.title}</h3>
                <p>{addon.note}</p>
              </div>
              <span className="addon-price mono">{addon.price}</span>
            </div>
          ))}
        </div>

        <div className="section-heading" style={{ marginTop: "110px" }}>
          <div>
            <p className="eyebrow">{copy.faqEyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: copy.faqHeading }} />
          </div>
        </div>

         <Faq items={faqItems} />
        <JsonLd
          data={[
            faqJsonLd(faqItems.map((item) => ({ question: item.q, answer: item.a }))),
            breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]),
          ]}
        />

        <div className="page-cta">
          <div>
            <h2>{copy.ctaHeading}</h2>
            <p>{copy.ctaBody}</p>
          </div>
          <Link href={copy.ctaHref} className="button button-dark">
            {copy.ctaLabel} <span>↗</span>
          </Link>
        </div>

        <p className="team-note">
          {copy.disclaimer}
        </p>
      </section>
    </main>
  );
}
