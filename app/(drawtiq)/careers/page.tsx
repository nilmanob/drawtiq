import Link from "next/link";
import { Faq } from "@/components/faq";
import { getCareersFaqs, getCareersPerks, getCareersProcess, getCareersRoles, getGlobalSettings } from "@/lib/content/cms";
import { getPageSeo, pageContent } from "@/lib/content/page-content";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, { data: settings }] = await Promise.all([
    getPageSeo("careers"),
    getGlobalSettings(),
  ]);
  const careersEmail = settings?.careers_email || "careers@drawtiq.studio";
  return {
    title: seo.title || "Careers",
    description:
      seo.description ||
      `Join Drawtiq — product, brand, motion, and video roles for people who care about craft. Write to ${careersEmail}.`,
    alternates: { canonical: "/careers" },
  };
}

const perks = [
  { n: "01", title: "Craft over churn", body: "We protect time for thinking, so the work is something you are proud to sign." },
  { n: "02", title: "Small team, big say", body: "Everyone shapes decisions. There is no layer between your idea and the work." },
  { n: "03", title: "Remote first", body: "Work from wherever you do your best thinking, with overlap hours that keep us close." },
  { n: "04", title: "Grow in public", body: "A training budget, time for side projects, and honest feedback that moves you forward." },
  { n: "05", title: "Healthy pace", body: "Sustainable timelines, real holidays, and no hero culture — ever." },
  { n: "06", title: "Tools that sing", body: "The kit you need to do great work, and a say in what we use next." },
];

const roles = [
  {
    title: "Senior Product Designer",
    meta: "Full-time · Remote (EU/US overlap)",
    body: "Lead end-to-end product design for our partners — from research and flows to polished, motion-ready interfaces.",
  },
  {
    title: "Brand Designer",
    meta: "Full-time · Remote",
    body: "Shape identities and systems that hold together across products, campaigns, and the everyday details.",
  },
  {
    title: "Motion Designer",
    meta: "Contract · Remote",
    body: "Bring brands and interfaces to life with motion that explains, guides, and delights.",
  },
  {
    title: "Video Editor",
    meta: "Contract · Remote",
    body: "Cut story-first films and social edits from the first assembly through colour, sound, and delivery.",
  },
  {
    title: "Design Engineer",
    meta: "Full-time · Remote",
    body: "Build the front-ends our designers imagine — accessible, fast, and animated with real craft.",
  },
];

const process = [
  { n: "01", title: "Say hello", body: "Send your portfolio and a short note about the work you love to make." },
  { n: "02", title: "A real conversation", body: "A relaxed call about your experience, your goals, and how we might work together." },
  { n: "03", title: "A small challenge", body: "A paid, time-boxed exercise that reflects the work — never free labour." },
  { n: "04", title: "Meet the studio", body: "Talk with the people you would work with, ask anything, and get a decision quickly." },
];

const faqs = [
  {
    q: "Do you hire remotely?",
    a: "Yes. Drawtiq is a remote-first studio. We ask for a few hours of overlap with the team, but your location is up to you.",
  },
  {
    q: "I don’t see a role that fits. Should I still apply?",
    a: "Definitely. We keep a warm list of people we would love to work with and reach out when the right project or opening appears.",
  },
  {
    q: "What should my application include?",
    a: "Your portfolio, a short note about the work you are proud of, and the role or discipline you are interested in. That is enough to start.",
  },
];

export default async function CareersPage() {
  const [perksResult, rolesResult, processResult, faqsResult, { data: settings }, hero, why, rolesHeading, roleOpen, hiring, faqHeading, cta] = await Promise.all([
    getCareersPerks(), getCareersRoles(), getCareersProcess(), getCareersFaqs(), getGlobalSettings(),
    pageContent("careers", "hero", {
      eyebrow: "08 / Careers",
      heading: "Do the best work<br />of your <em>career.</em>",
      lead: "We're a small studio. We care about the work, protect time to think, and don't confuse busy with good. If that sounds like you, send us something you're proud of.",
      primaryLabel: "Send your portfolio",
      primaryEmail: "careers@drawtiq.studio",
      secondaryLabel: "See open roles",
    }),
    pageContent("careers", "why", {
      eyebrow: "Why Drawtiq",
      heading: "A place to do<br /><em>your best work.</em>",
      note: "Good work takes time. We plan for it, and we don't confuse busy with good.",
    }),
    pageContent("careers", "roles", {
      eyebrow: "Open roles",
      heading: "Come build<br /><em>with us.</em>",
      note: "Roles we are opening as the studio grows. Speculative applications welcome.",
      applyLabel: "Apply for this role",
    }),
    pageContent("careers", "role-open", {
      heading: "Don't see your role?",
      body: "Tell us what you do and what you would love to make. We keep a warm list and reach out when the right project appears.",
      label: "Send a speculative note",
      email: "careers@drawtiq.studio",
    }),
    pageContent("careers", "hiring", {
      eyebrow: "How hiring works",
      heading: "Clear, kind,<br /><em>and quick.</em>",
    }),
    pageContent("careers", "faq", {
      eyebrow: "A few common questions",
      heading: "Good to <em>know.</em>",
    }),
    pageContent("careers", "cta", {
      heading: "Ready when you are.",
      body: "Send your work — we read every note that lands in the studio.",
      label: "Email the studio",
      email: "careers@drawtiq.studio",
    }),
  ]);
  const careersEmail = settings?.careers_email || "careers@drawtiq.studio";
  const perkItems = perksResult.data.length
    ? perksResult.data.map((item) => ({ n: item.number, title: item.title, body: item.body })) : perks;
  const roleItems = rolesResult.data.length ? rolesResult.data : roles;
  const processItems = processResult.data.length
    ? processResult.data.map((item) => ({ n: item.number, title: item.title, body: item.body })) : process;
  const faqItems = faqsResult.data.length
    ? faqsResult.data.map((item) => ({ q: item.question, a: item.answer })) : faqs;
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          {hero.eyebrow}
        </p>
        <h1 dangerouslySetInnerHTML={{ __html: hero.heading }} />
        <p className="lead">{hero.lead}</p>
        <div className="hero-actions" style={{ marginTop: "30px" }}>
          <a href={`mailto:${hero.primaryEmail || careersEmail}`} className="button button-dark">
            {hero.primaryLabel} <span>↗</span>
          </a>
          <Link href="#open-roles" className="text-link">
            {hero.secondaryLabel} <span>↓</span>
          </Link>
        </div>
      </section>

      <section className="page-content section-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{why.eyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: why.heading }} />
          </div>
          <p className="heading-note">{why.note}</p>
        </div>

        <div className="value-grid value-grid-3">
          {perkItems.map((perk) => (
            <article className="value-card" key={perk.n}>
              <span className="mono">{perk.n}</span>
              <h3>{perk.title}</h3>
              <p>{perk.body}</p>
            </article>
          ))}
        </div>

        <div className="section-heading" id="open-roles" style={{ marginTop: "110px" }}>
          <div>
            <p className="eyebrow">{rolesHeading.eyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: rolesHeading.heading }} />
          </div>
          <p className="heading-note">{rolesHeading.note}</p>
        </div>

        <div className="role-list">
          {roleItems.map((role) => (
            <article className="role-card" key={role.title}>
              <div className="role-head">
                <h3>{role.title}</h3>
                <span className="role-meta mono">{role.meta}</span>
              </div>
              <p>{role.body}</p>
              <a href={`mailto:${careersEmail}`} className="text-link">
                {rolesHeading.applyLabel} <span>↗</span>
              </a>
            </article>
          ))}
        </div>

        <div className="role-open">
          <h3>{roleOpen.heading}</h3>
          <p>{roleOpen.body}</p>
          <a href={`mailto:${roleOpen.email || careersEmail}`} className="button button-accent">
            {roleOpen.label} <span>↗</span>
          </a>
        </div>

        <div className="section-heading" style={{ marginTop: "110px" }}>
          <div>
            <p className="eyebrow">{hiring.eyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: hiring.heading }} />
          </div>
        </div>

        <div className="process-track">
          <div className="process-line"><span></span></div>
          {processItems.map((step) => (
            <article className="process-step" key={step.n}>
              <span className="step-index">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>

        <div className="section-heading" style={{ marginTop: "110px" }}>
          <div>
            <p className="eyebrow">{faqHeading.eyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: faqHeading.heading }} />
          </div>
        </div>

         <Faq items={faqItems} />

        <div className="page-cta">
          <div>
            <h2>{cta.heading}</h2>
            <p>{cta.body}</p>
          </div>
          <a href={`mailto:${cta.email || careersEmail}`} className="button button-dark">
            {cta.label} <span>↗</span>
          </a>
        </div>
      </section>
    </main>
  );
}
