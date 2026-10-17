import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const cases = {
  northstar: {
    title: "Northstar Finance",
    sub: "Making money feel human.",
    lead: "A calmer, clearer way to understand your financial picture and take the next step with confidence.",
    discipline: "UI/UX · Product design",
    industry: "Fintech",
    scope: "Product strategy, UX, UI",
    brand: "northstar",
    number: "$248,590",
    challenge:
      "Financial information can be powerful, but dense dashboards often make the next step hard to see. This concept explores how hierarchy, language, and a calmer interface can make the experience feel more approachable.",
    category: "Case study / UI/UX",
  },
  bloomwell: {
    title: "Bloomwell",
    sub: "A softer kind of wellness.",
    lead: "An approachable visual identity and digital experience for everyday wellbeing.",
    discipline: "Brand identity · Digital design",
    industry: "Wellness",
    scope: "Identity, art direction, UI",
    brand: "bloomwell",
    number: "b.",
    challenge:
      "Wellness can feel crowded with competing messages. This concept explores a quieter, more human visual language built around warmth, confidence, and clarity.",
    category: "Case study / Branding",
  },
  "form-object": {
    title: "Form & Object",
    sub: "Less, but better.",
    lead: "A considered visual world for everyday objects that deserve a little more thought.",
    discipline: "Graphic design · Art direction",
    industry: "E-commerce",
    scope: "Campaign, packaging, art direction",
    brand: "FORM / OBJECT",
    number: "FORM",
    challenge:
      "A product range needs to feel cohesive without losing the character of individual objects. This concept uses restrained typography and tactile composition to bring a point of view to the collection.",
    category: "Case study / Graphic",
  },
  orbit: {
    title: "Orbit Workspace",
    sub: "Less admin. More momentum.",
    lead: "A more coherent workspace experience designed to help teams understand what needs attention.",
    discipline: "UI/UX · Product design",
    industry: "SaaS",
    scope: "UX flows, dashboard UI",
    brand: "orbit.",
    number: "18",
    challenge:
      "When team information is scattered across multiple views, it can be hard to see progress and priorities. This concept organizes key signals into a clearer, more scannable dashboard.",
    category: "Case study / UI/UX",
  },
  goodkind: {
    title: "Goodkind",
    sub: "Care, made visible.",
    lead: "A warm, flexible identity direction for a purpose-led community brand.",
    discipline: "Brand identity · Graphic design",
    industry: "Community",
    scope: "Identity, guidelines, campaign",
    brand: "goodkind",
    number: "g.",
    challenge:
      "Purpose-led brands need to feel distinctive and welcoming while remaining consistent across many touchpoints. This concept balances a friendly tone with a practical identity system.",
    category: "Case study / Branding",
  },
  "field-notes": {
    title: "Field Notes",
    sub: "Make room to think.",
    lead: "An editorial design concept for sharing ideas, observations, and work in progress.",
    discipline: "Graphic design · Editorial",
    industry: "Publishing",
    scope: "Art direction, typography, layouts",
    brand: "FIELD NOTES",
    number: "006",
    challenge:
      "A collection of ideas needs a visual rhythm that supports reading instead of competing with it. This concept uses typography and a flexible grid to make each note feel part of one system.",
    category: "Case study / Graphic",
  },
};

type Props = {
  params: { project: string };
};

type CaseData = typeof cases.northstar;
const getCaseData = (project: string): CaseData => (cases[project as keyof typeof cases] || cases.northstar);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = getCaseData(params.project);
  return {
    title: `${data.title} — Case Study | Drawtiq`,
    description: `Design concept for ${data.title}. ${data.lead}`,
    alternates: { canonical: `/case-study/${params.project}` },
  };
}

export default function CaseStudyPage({ params }: Props) {
  const data = getCaseData(params.project);
  const projectKey = params.project as keyof typeof cases;

  if (!cases[projectKey]) notFound();

  const set = (id: string, value: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  return (
    <main id="main">        <section className="page-hero section-wrap detail-hero">
        <p className="eyebrow">
          <span className="status-dot"></span>
          {data.category}
        </p>
        <h1 id="case-title" data-reveal data-reveal-delay="0.05">{data.title}<br /><em>{data.sub}</em></h1>
        <p className="lead" id="case-lead" data-reveal data-reveal-delay="0.15">{data.lead}</p>
        <div className="case-meta">
          <div>
            <span className="mono">DISCIPLINE</span>
            <strong id="case-discipline">{data.discipline}</strong>
          </div>
          <div>
            <span className="mono">INDUSTRY</span>
            <strong id="case-industry">{data.industry}</strong>
          </div>
          <div>
            <span className="mono">SCOPE</span>
            <strong id="case-scope">{data.scope}</strong>
          </div>
          <div>
            <span className="mono">PROJECT TYPE</span>
            <strong>Illustrative concept</strong>
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="case-visual visual-fintech">
          <div className="mock-window">
            <div className="mock-top">
              <b id="case-brand">{data.brand}</b>
              <span>•••</span>
            </div>
            <div className="mock-balance">
              <small>Overview / Monthly snapshot</small>
              <strong id="case-number">{data.number}</strong>
              <span className="growth">↗ Clearer insights, less friction</span>
            </div>
            <svg viewBox="0 0 500 140" preserveAspectRatio="none">
              <path
                d="M0 110 C40 96 45 112 80 76 S130 88 165 53 S230 76 270 38 S330 63 370 24 S435 36 500 8"
                fill="none"
                stroke="#c8ff43"
                stroke-width="3"
              />
              <path
                d="M0 110 C40 96 45 112 80 76 S130 88 165 53 S230 76 270 38 S330 63 370 24 S435 36 500 8 L500 140 L0 140Z"
                fill="#c8ff43"
                opacity=".08"
              />
            </svg>
            <div className="mock-bottom">
              <span>Overview</span>
              <span>Activity</span>
              <span>Insights</span>
            </div>
          </div>
          <div className="fintech-orb"></div>
          <span className="visual-label mono">DESIGN EXPLORATION / DRAWtiq</span>
        </div>
      </section>

      <section className="section-wrap">
        <div className="case-story">
          <div>
            <p className="eyebrow">01 / The challenge</p>
            <h2 id="case-problem-title" data-reveal data-reveal-delay="0.2">Find the signal in the noise.</h2>
            <p id="case-challenge" data-reveal data-reveal-delay="0.25">{data.challenge}</p>
          </div>
          <div>
            <p>
              The experience needed to help people make sense of dense information without making the product feel
              simplistic. The challenge was to establish a clear hierarchy while keeping meaningful depth close at
              hand.
            </p>
          </div>
        </div>
        <div className="case-story">
          <div>
            <p className="eyebrow">02 / The approach</p>
            <h2 id="case-approach" data-reveal data-reveal-delay="0.3">Start with the human question.</h2>
            <p id="case-approach">
              We organized the experience around the questions a user arrives with: Where do I stand? What changed?
              What should I look at next?
            </p>
            <ul>
              <li>Give the most important information a clear visual priority.</li>
              <li>Use consistent patterns for summaries, trends, and supporting details.</li>
              <li>Make key actions easy to scan and understand.</li>
              <li>Use color as a functional cue, not decoration.</li>
            </ul>
          </div>
        </div>
        <div className="case-story">
          <div>
            <p className="eyebrow">03 / The solution</p>
            <h2 id="case-solution" data-reveal data-reveal-delay="0.35">Clarity built into the system.</h2>
            <p>
              A considered type scale, restrained palette, modular cards, and simple chart language create a more
              coherent product experience. Responsive layouts keep the hierarchy intact as the available space changes.
            </p>
            <div className="case-stats">
              <div className="case-stat">
                <strong>01</strong>
                <span>Clear primary summary</span>
              </div>
              <div className="case-stat">
                <strong>02</strong>
                <span>Consistent data patterns</span>
              </div>
              <div className="case-stat">
                <strong>03</strong>
                <span>Focused next steps</span>
              </div>
            </div>
          </div>
        </div>
        <div className="case-story">
          <div>
            <p className="eyebrow">04 / The outcome</p>
            <h2 id="case-outcome" data-reveal data-reveal-delay="0.4">Designed for better decisions.</h2>
            <p>
              This is a design concept, so there are no verified client performance results or before-and-after
              metrics to report. In a live engagement, the next step would be to validate the experience with usability
              testing and measure task completion, comprehension, and confidence.
            </p>
            <p className="team-note">
              All names, screens, and results on this page are illustrative concept material—not commissioned client
              work or measured outcomes.
            </p>
          </div>
        </div>
      </section>

      <div className="page-cta">
        <div>
          <h2 data-reveal data-reveal-delay="0.45">Have a similar challenge?</h2>
          <p>Let’s shape a thoughtful solution around your users and goals.</p>
        </div>
        <Link href="/contact" className="button button-dark">
          Start a project <span>↗</span>
        </Link>
      </div>
      <p style={{ padding: "40px 0" }}>
        <Link href="/work" className="text-link" data-reveal data-reveal-delay="0.5">
          ← Back to all work <span>↗</span>
        </Link>
      </p>
    </main>
  );
}
