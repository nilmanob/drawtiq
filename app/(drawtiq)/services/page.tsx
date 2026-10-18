import Link from "next/link";

export const metadata = {
  title: "Services",
  description:
    "UI/UX, digital product design, brand identity, graphic design, motion design, and video editing services by Drawtiq.",
};

export default function ServicesPage() {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          02 / What we do
        </p>
        <h1>Good thinking.<br /><em>Beautifully made.</em></h1>
        <p className="lead">
          From the first question to the final detail, we bring strategy and craft together to make every interaction count.
        </p>
      </section>

      <section className="page-content section-wrap">
        <h2 className="sr-only">Our services</h2>
        <div className="service-list">
          <Link className="service-row" href="/service-ui-ux">
            <span className="service-number mono">01</span>
            <div className="service-icon icon-ux">↗</div>
            <div className="service-title">
              <h3>UI/UX Design</h3>
              <p>Make every interaction feel effortless.</p>
            </div>
            <div className="service-detail">Research · User journeys · Wireframes · Prototyping · Usability</div>
            <span className="service-arrow">↗</span>
          </Link>
          <Link className="service-row" href="/service-ui-ux">
            <span className="service-number mono">02</span>
            <div className="service-icon icon-product">◫</div>
            <div className="service-title">
              <h3>Digital Product Design</h3>
              <p>Complex tools, clear experiences.</p>
            </div>
            <div className="service-detail">SaaS · Web apps · Mobile apps · Design systems</div>
            <span className="service-arrow">↗</span>
          </Link>
          <Link className="service-row" href="/service-graphic-design">
            <span className="service-number mono">03</span>
            <div className="service-icon icon-brand">✳</div>
            <div className="service-title">
              <h3>Brand Identity</h3>
              <p>Look like you mean it.</p>
            </div>
            <div className="service-detail">Strategy · Identity systems · Guidelines · Art direction</div>
            <span className="service-arrow">↗</span>
          </Link>
          <Link className="service-row" href="/service-graphic-design">
            <span className="service-number mono">04</span>
            <div className="service-icon icon-graphic">Aa</div>
            <div className="service-title">
              <h3>Graphic Design</h3>
              <p>Ideas with a visual point of view.</p>
            </div>
            <div className="service-detail">Campaigns · Packaging · Editorial · Social · Print</div>
            <span className="service-arrow">↗</span>
          </Link>
          <Link className="service-row" href="/service-motion-design">
            <span className="service-number mono">05</span>
            <div className="service-icon icon-motion">◉</div>
            <div className="service-title">
              <h3>Motion Design</h3>
              <p>Give ideas movement, rhythm, and life.</p>
            </div>
            <div className="service-detail">Storyboards · Animation · Motion systems · Lottie</div>
            <span className="service-arrow">↗</span>
          </Link>
          <Link className="service-row" href="/service-video-editing">
            <span className="service-number mono">06</span>
            <div className="service-icon icon-video">✂</div>
            <div className="service-title">
              <h3>Video Editing</h3>
              <p>Cut, pace, and polish the story.</p>
            </div>
            <div className="service-detail">Edit · Color · Sound · Social cutdowns · Titles</div>
            <span className="service-arrow">↗</span>
          </Link>
        </div>

        <div className="service-note">
          <span className="drawn-underline">Small details. Bigger picture.</span>
          <span className="mono">STRATEGY × DESIGN × DELIVERY</span>
        </div>

        <div className="service-pair">
          <article className="service-panel">
            <span className="mono">ENGAGEMENT / 01</span>
            <h3>Focused project</h3>
            <p>A clear brief, a shared timeline, and a defined outcome. Ideal for a new product, a brand refresh, or a specific design challenge.</p>
            <Link href="/contact" className="text-link">
              Discuss a project <span>↗</span>
            </Link>
          </article>
          <article className="service-panel">
            <span className="mono">ENGAGEMENT / 02</span>
            <h3>Ongoing design partner</h3>
            <p>A flexible collaboration for teams that need a considered design partner as ideas, products, and campaigns evolve.</p>
            <Link href="/contact" className="text-link">
              Explore a partnership <span>↗</span>
            </Link>
          </article>
        </div>

        <div className="page-cta">
          <div>
            <h2>Not sure what you need?</h2>
            <p>Tell us about the challenge. We'll help you find the right starting point.</p>
          </div>
          <Link href="/contact" className="button button-dark">
            Let's talk <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
