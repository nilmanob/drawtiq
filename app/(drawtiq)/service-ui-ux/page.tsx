import Link from "next/link";

export const metadata = {
  title: "UI/UX Design | Drawtiq",
  description: "Research-led UI/UX and digital product design by Drawtiq.",
};

export default function ServiceUIPage() {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          03 / Service detail
        </p>
        <h1>Make every interaction feel effortless.</h1>
        <p className="lead">
          We design digital products around real people, clear journeys, and the details that make complex things feel simple.
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

      <section className="page-content section-wrap">
        <div className="service-detail-grid">
          <div className="service-detail-copy">
            <p className="eyebrow">A considered approach</p>
            <h2>UI/UX Design that feels <em>clear.</em></h2>
            <p>
              From early discovery to polished prototypes, our work connects user needs with product goals—so the
              experience feels intuitive and the interface has a clear purpose.
            </p>
            <p>
              We bring the right amount of structure to each project: enough to make decisions with confidence, and
              enough curiosity to discover a better answer when one appears.
            </p>
            <Link href="/work" className="text-link">
              Explore selected work <span>↗</span>
            </Link>
          </div>
          <div id="deliverables">
            <p className="eyebrow">What’s included</p>
            <div className="deliverables">
              <article className="deliverable">
                <span className="mono">01</span>
                <div>
                  <h3>Research & discovery</h3>
                  <p>Stakeholder conversations, user needs, product goals, and a shared definition of success.</p>
                </div>
              </article>
              <article className="deliverable">
                <span className="mono">02</span>
                <div>
                  <h3>Information architecture</h3>
                  <p>Content structure, user flows, navigation models, and clear task journeys.</p>
                </div>
              </article>
              <article className="deliverable">
                <span className="mono">03</span>
                <div>
                  <h3>Wireframes & interaction</h3>
                  <p>Low- and high-fidelity screens that establish hierarchy, behavior, and key states.</p>
                </div>
              </article>
              <article className="deliverable">
                <span className="mono">04</span>
                <div>
                  <h3>Visual interface design</h3>
                  <p>A polished UI system with thoughtful typography, spacing, color, and component patterns.</p>
                </div>
              </article>
              <article className="deliverable">
                <span className="mono">05</span>
                <div>
                  <h3>Interactive prototype</h3>
                  <p>Clickable prototypes to communicate intent, validate flows, and support stakeholder alignment.</p>
                </div>
              </article>
              <article className="deliverable">
                <span className="mono">06</span>
                <div>
                  <h3>Design system & handoff</h3>
                  <p>Reusable components, usage notes, responsive states, and organized developer handoff.</p>
                </div>
              </article>
            </div>
          </div>
        </div>

        <div className="service-pair">
          <article className="service-panel">
            <span className="mono">01 / ALIGN</span>
            <h3>Discover & define</h3>
            <p>We clarify goals, audiences, constraints, and success criteria before visual decisions begin.</p>
          </article>
          <article className="service-panel">
            <span className="mono">02 / MAKE</span>
            <h3>Design & refine</h3>
            <p>We explore directions, share work early, and refine the details through feedback and testing.</p>
          </article>
        </div>

        <div className="section-heading" style={{ marginTop: "100px" }}>
          <div>
            <p className="eyebrow">A few common questions</p>
            <h2>Good to <em>know.</em></h2>
          </div>
        </div>

        <div className="faq-list">
          <div className="faq-item">
            <button className="faq-question" aria-expanded="false">
              <span>How long does a typical project take?</span>
              <span>+</span>
            </button>
            <div className="faq-answer" hidden>
              It depends on scope, decision-making, and the number of deliverables. After an initial conversation, we’ll
              recommend a realistic timeline and milestones.
            </div>
          </div>
          <div className="faq-item">
            <button className="faq-question" aria-expanded="false">
              <span>Can you work with our existing brand or product?</span>
              <span>+</span>
            </button>
            <div className="faq-answer" hidden>
              Yes. We can extend an existing system, improve a specific experience, or help establish a new direction
              where needed.
            </div>
          </div>
          <div className="faq-item">
            <button className="faq-question" aria-expanded="false">
              <span>What do you need to get started?</span>
              <span>+</span>
            </button>
            <div className="faq-answer" hidden>
              A short conversation about your goals, audience, timeline, and constraints is enough to begin. We can help
              shape the brief together.
            </div>
          </div>
        </div>

        <div className="page-cta">
          <div>
            <h2>Need a distinctive visual identity?</h2>
            <p>Explore brand identity and graphic design.</p>
          </div>
          <Link href="/service-graphic-design" className="button button-dark">
            Explore service <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
