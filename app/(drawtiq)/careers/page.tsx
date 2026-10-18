import Link from "next/link";
import { Faq } from "@/components/faq";

export const metadata = {
  title: "Careers",
  description:
    "Join Drawtiq — product, brand, motion, and video roles for people who care about craft.",
  alternates: { canonical: "/careers" },
};

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

export default function CareersPage() {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          08 / Careers
        </p>
        <h1>
          Do the best work<br />
          of your <em>career.</em>
        </h1>
        <p className="lead">
          We are a small studio with a big appetite for thoughtful work. If you care about clarity, craft, and making
          things people genuinely enjoy, we would love to meet you.
        </p>
        <div className="hero-actions" style={{ marginTop: "30px" }}>
          <a href="mailto:careers@drawtiq.studio" className="button button-dark">
            Send your portfolio <span>↗</span>
          </a>
          <Link href="#open-roles" className="text-link">
            See open roles <span>↓</span>
          </Link>
        </div>
      </section>

      <section className="page-content section-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Why Drawtiq</p>
            <h2>
              A place to do<br />
              <em>your best work.</em>
            </h2>
          </div>
          <p className="heading-note">
            We are building a studio where good people can do ambitious work without burning out.
          </p>
        </div>

        <div className="value-grid value-grid-3">
          {perks.map((perk) => (
            <article className="value-card" key={perk.n}>
              <span className="mono">{perk.n}</span>
              <h3>{perk.title}</h3>
              <p>{perk.body}</p>
            </article>
          ))}
        </div>

        <div className="section-heading" id="open-roles" style={{ marginTop: "110px" }}>
          <div>
            <p className="eyebrow">Open roles</p>
            <h2>
              Come build<br />
              <em>with us.</em>
            </h2>
          </div>
          <p className="heading-note">Roles we are opening as the studio grows. Speculative applications welcome.</p>
        </div>

        <div className="role-list">
          {roles.map((role) => (
            <article className="role-card" key={role.title}>
              <div className="role-head">
                <h3>{role.title}</h3>
                <span className="role-meta mono">{role.meta}</span>
              </div>
              <p>{role.body}</p>
              <a href="mailto:careers@drawtiq.studio" className="text-link">
                Apply for this role <span>↗</span>
              </a>
            </article>
          ))}
        </div>

        <div className="role-open">
          <h3>Don’t see your role?</h3>
          <p>
            Tell us what you do and what you would love to make. We keep a warm list and reach out when the right
            project appears.
          </p>
          <a href="mailto:careers@drawtiq.studio" className="button button-accent">
            Send a speculative note <span>↗</span>
          </a>
        </div>

        <div className="section-heading" style={{ marginTop: "110px" }}>
          <div>
            <p className="eyebrow">How hiring works</p>
            <h2>
              Clear, kind,<br />
              <em>and quick.</em>
            </h2>
          </div>
        </div>

        <div className="process-track">
          <div className="process-line"><span></span></div>
          {process.map((step) => (
            <article className="process-step" key={step.n}>
              <span className="step-index">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
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
            <h2>Ready when you are.</h2>
            <p>Send your work — we read every note that lands in the studio.</p>
          </div>
          <a href="mailto:careers@drawtiq.studio" className="button button-dark">
            Email the studio <span>↗</span>
          </a>
        </div>
      </section>
    </main>
  );
}
