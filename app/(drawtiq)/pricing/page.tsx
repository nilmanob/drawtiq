import Link from "next/link";
import { Faq } from "@/components/faq";
import { PricingPlans } from "@/components/pricing-plans";

export const metadata = {
  title: "Pricing",
  description:
    "Transparent monthly design plans for UI/UX, brand identity, graphic design, motion design, and video editing by Drawtiq.",
  alternates: { canonical: "/pricing" },
};

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

export default function PricingPage() {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          07 / Pricing
        </p>
        <h1>
          Simple pricing.<br />
          <em>Serious craft.</em>
        </h1>
        <p className="lead">
          One clear monthly rate, no hourly guesswork, and a team that already knows your brand. Choose the plan that
          matches the pace you need.
        </p>
      </section>

      <section className="page-content section-wrap">
        <PricingPlans />

        <div className="pricing-included">
          <p className="eyebrow">Every plan includes</p>
          <div className="included-grid">
            {included.map((item) => (
              <div className="included-item" key={item}>
                <span aria-hidden="true">✳</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="section-heading" style={{ marginTop: "110px" }}>
          <div>
            <p className="eyebrow">Ways to work together</p>
            <h2>
              Pick the rhythm<br />
              <em>that fits.</em>
            </h2>
          </div>
          <p className="heading-note">
            Plans and projects are all built on the same process and the same care — only the pace changes.
          </p>
        </div>

        <div className="value-grid value-grid-3">
          {models.map((model) => (
            <article className="value-card" key={model.n}>
              <span className="mono">{model.n}</span>
              <h3>{model.title}</h3>
              <p>{model.body}</p>
            </article>
          ))}
        </div>

        <div className="section-heading" style={{ marginTop: "110px" }}>
          <div>
            <p className="eyebrow">Add-ons</p>
            <h2>
              One-off <em>extras.</em>
            </h2>
          </div>
          <p className="heading-note">Standalone engagements you can add to any plan, or book on their own.</p>
        </div>

        <div className="addon-list">
          {addons.map((addon) => (
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
            <p className="eyebrow">A few common questions</p>
            <h2>
              Good to <em>know.</em>
            </h2>
          </div>
        </div>

        <Faq items={faqs} />

        <div className="page-cta">
          <div>
            <h2>Not sure which plan fits?</h2>
            <p>Tell us about the work. We will recommend the simplest way to start.</p>
          </div>
          <Link href="/contact" className="button button-dark">
            Let’s talk <span>↗</span>
          </Link>
        </div>

        <p className="team-note">
          Prices are shown in USD and are indicative starting points for planning, not a formal quote.
        </p>
      </section>
    </main>
  );
}
