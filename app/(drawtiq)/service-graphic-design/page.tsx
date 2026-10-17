import Link from "next/link";

export const metadata = {
  title: "Graphic Design & Branding | Drawtiq",
  description: "Brand identity, graphic design, and art direction by Drawtiq.",
};

export default function ServiceGraphicDesignPage() {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          04 / Service detail
        </p>
        <h1>Give good ideas a visual point of view.</h1>
        <p className="lead">
          We build distinctive visual identities and graphic systems that help brands communicate with clarity,
          character, and consistency.
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
            <h2>Graphic Design & Branding that feels <em>clear.</em></h2>
            <p>
              From the core identity to the everyday assets that bring it to life, we make visual systems that are
              recognizable, adaptable, and built to work in the real world.
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
                  <h3>Brand direction</h3>
                  <p>A coherent visual direction shaped around positioning, audience, personality, and ambition.</p>
                </div>
              </article>
              <article className="deliverable">
                <span className="mono">02</span>
                <div>
                  <h3>Logo & identity system</h3>
                  <p>Distinctive marks, supporting elements, and flexible identity variations.</p>
                </div>
              </article>
              <article className="deliverable">
                <span className="mono">03</span>
                <div>
                  <h3>Typography & color</h3>
                  <p>A practical type and color system with rules that keep the brand consistent.</p>
                </div>
              </article>
              <article className="deliverable">
                <span className="mono">04</span>
                <div>
                  <h3>Brand guidelines</h3>
                  <p>Clear usage principles, examples, and handoff assets for teams and partners.</p>
                </div>
              </article>
              <article className="deliverable">
                <span className="mono">05</span>
                <div>
                  <h3>Campaign & social graphics</h3>
                  <p>Reusable creative assets for launches, campaigns, social channels, and digital promotion.</p>
                </div>
              </article>
              <article className="deliverable">
                <span className="mono">06</span>
                <div>
                  <h3>Packaging & editorial</h3>
                  <p>Considered layouts and print-ready artwork for packaging, publications, and collateral.</p>
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
            <h2>Need a better digital experience?</h2>
            <p>Explore UI/UX and digital product design.</p>
          </div>
          <Link href="/service-ui-ux" className="button button-dark">
            Explore service <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
