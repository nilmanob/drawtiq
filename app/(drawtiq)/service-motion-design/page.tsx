import Link from "next/link";
import { Faq } from "@/components/faq";

const deliverables = [
  {
    n: "01",
    title: "Motion direction",
    body: "A clear motion language for the brand or product — what moves, how fast, and why it moves at all.",
  },
  {
    n: "02",
    title: "Storyboards & style frames",
    body: "Frame-by-frame planning and key visuals so the sequence is agreed before a single asset is animated.",
  },
  {
    n: "03",
    title: "UI & product animation",
    body: "Transitions, micro-interactions, and state changes that make an interface feel responsive and alive.",
  },
  {
    n: "04",
    title: "Brand & logo motion",
    body: "Animated marks, idents, and openers that give a brand a signature way of arriving on screen.",
  },
  {
    n: "05",
    title: "Social & campaign motion",
    body: "Scroll-stopping loops, explainers, and ad variants designed for every placement and ratio.",
  },
  {
    n: "06",
    title: "Motion systems & handoff",
    body: "Timing, easing, and export-ready assets (Lottie, MP4, WebM) documented for your team to reuse.",
  },
];

const faqs = [
  {
    q: "Can motion work fit an existing brand?",
    a: "Yes. We start from your current identity and build a motion layer that extends it — same voice, new dimension.",
  },
  {
    q: "Which formats will we receive?",
    a: "Deliverables are shaped to where they live: Lottie or code-ready assets for product, and MP4, WebM, or ProRes for film and social.",
  },
  {
    q: "How do you keep animation performant?",
    a: "We design for 60fps on real devices, keep easing and structure simple, and test on lower-powered hardware before handoff.",
  },
];

export const metadata = {
  title: "Motion Design",
  description:
    "Motion design and animation for digital products, brands, and campaigns by Drawtiq.",
};

export default function ServiceMotionDesignPage() {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          05 / Service detail
        </p>
        <h1>Give ideas movement, rhythm, and life.</h1>
        <p className="lead">
          We use motion to explain, guide, and delight — turning static screens and brands into experiences that feel
          responsive, intentional, and alive.
        </p>
        <div className="hero-actions" style={{ marginTop: "30px" }}>
          <Link href="/contact" className="button button-dark">
            Start a project <span>↗</span>
          </Link>
          <Link href="#deliverables" className="text-link">
            Explore deliverables <span>↓</span>
          </Link>
        </div>
      </section>

      <section className="section-wrap">
        <div className="service-visual visual-motion">
          <div className="motion-stage">
            <div className="motion-orb"></div>
            <svg viewBox="0 0 520 300" preserveAspectRatio="none" aria-hidden="true">
              <path
                d="M24 258 C 150 258, 168 42, 260 42 S 372 258, 496 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line x1="24" y1="258" x2="496" y2="258" stroke="currentColor" strokeDasharray="4 9" opacity=".28" />
              <circle cx="24" cy="258" r="7" fill="var(--accent)" />
              <circle cx="260" cy="42" r="7" fill="var(--accent)" />
              <circle cx="496" cy="42" r="7" fill="var(--accent)" />
            </svg>
            <div className="motion-bar">
              <i style={{ height: "34%" }}></i>
              <i style={{ height: "58%" }}></i>
              <i style={{ height: "44%" }}></i>
              <i style={{ height: "82%" }}></i>
              <i style={{ height: "62%" }}></i>
              <i style={{ height: "96%" }}></i>
            </div>
            <span className="motion-badge mono">EASE / 400MS</span>
          </div>
          <span className="visual-label mono">MOTION SYSTEM / DRAWTIQ</span>
        </div>
      </section>

      <section className="page-content section-wrap">
        <div className="service-detail-grid">
          <div className="service-detail-copy">
            <p className="eyebrow">A considered approach</p>
            <h2>Motion that explains, not just <em>entertains.</em></h2>
            <p>
              Motion is the part of a design people feel before they can name it. We treat it as a language: every
              transition should answer a question, show a relationship, or reward an action.
            </p>
            <p>
              From a single loading state to a full campaign film, we keep the movement purposeful, performant, and
              unmistakably yours.
            </p>
            <Link href="/work" className="text-link">
              See movement in context <span>↗</span>
            </Link>
          </div>
          <div id="deliverables">
            <p className="eyebrow">What’s included</p>
            <div className="deliverables">
              {deliverables.map((item) => (
                <article className="deliverable" key={item.n}>
                  <span className="mono">{item.n}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="service-pair">
          <article className="service-panel">
            <span className="mono">01 / DESIGN</span>
            <h3>Define the motion language</h3>
            <p>We agree on timing, easing, and intent so every animation shares one clear personality.</p>
          </article>
          <article className="service-panel">
            <span className="mono">02 / DELIVER</span>
            <h3>Animate & hand off</h3>
            <p>We produce the sequences and export assets your team can ship and reuse with confidence.</p>
          </article>
        </div>

        <div className="section-heading" style={{ marginTop: "100px" }}>
          <div>
            <p className="eyebrow">A few common questions</p>
            <h2>Good to <em>know.</em></h2>
          </div>
        </div>

        <Faq items={faqs} />

        <div className="page-cta">
          <div>
            <h2>Need the final cut too?</h2>
            <p>Explore video editing and post-production with Drawtiq.</p>
          </div>
          <Link href="/service-video-editing" className="button button-dark">
            Explore service <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
