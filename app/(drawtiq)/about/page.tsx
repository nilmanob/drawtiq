import Link from "next/link";

export const metadata = {
  title: "About the Studio",
  description:
    "Drawtiq is an independent design studio for digital products and brand identities that need to work in the real world.",
};

export default function AboutPage() {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          05 / The studio
        </p>
        <h1>Not just how it looks.<br /><em>How it works.</em></h1>
        <p className="lead">
          We make digital products and identities for teams who want the work to do a job—not just look the part.
        </p>
      </section>

      <figure className="studio-band">
        <img
          className="studio-band-media"
          src="/assets/about/drawtiq-studio-1600.webp"
          srcSet="/assets/about/drawtiq-studio-800.webp 800w, /assets/about/drawtiq-studio-1200.webp 1200w, /assets/about/drawtiq-studio-1600.webp 1600w, /assets/about/drawtiq-studio-2000.webp 2000w, /assets/about/drawtiq-studio-2560.webp 2560w"
          sizes="(min-width: 701px) 240vw, 215vw"
          width={2752}
          height={1536}
          alt="A printed detail of the studio: a plant, desk, and quiet corner in black and white."
          loading="lazy"
          decoding="async"
        />
        <figcaption className="studio-band-caption">
          <span className="mono">
            <span className="status-dot" aria-hidden="true"></span>
            Studio study / no. 05
          </span>
          <span className="mono">A quiet corner, in print.</span>
        </figcaption>
      </figure>

      <section className="page-content section-wrap">
        <div className="about-split">
          <div className="about-art">
            <div className="art-grid"></div>
            <svg viewBox="0 0 400 400" role="img" aria-label="Drawtiq geometric studio mark">
              <path
                d="M70 200 C70 70 330 70 330 200 S70 330 70 200Z M120 200 C120 120 280 120 280 200 S120 280 120 200Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M200 70V330M70 200H330" stroke="currentColor" strokeDasharray="3 7" opacity=".4" />
              <circle cx="200" cy="200" r="12" fill="#c8ff43" />
            </svg>
            <div className="art-sticker">Made with<br />intention<span>✳</span></div>
          </div>
          <div className="service-detail-copy">
            <p className="eyebrow">Our point of view</p>
            <h2>Curiosity, plain talk, and <em>care.</em></h2>
            <p>
              We&apos;re a small studio. We work directly with founders and product teams, ask a lot of questions, and
              stay close to the work from first sketch to launch. No handoffs to a mystery team.
            </p>
            <p>No design theatre. No decks that die in a folder. Just clear decisions and work that ships.</p>
            <p>We do our best work when design is part of the thinking from the beginning—not a layer added at the end.</p>
          </div>
        </div>

        <div className="section-heading" style={{ marginTop: "100px" }}>
          <div>
            <p className="eyebrow">What guides us</p>
            <h2>A few things we <em>believe.</em></h2>
          </div>
        </div>

        <div className="value-grid">
          <article className="value-card">
            <span className="mono">01 / CURIOUS</span>
            <h3>Ask better questions.</h3>
            <p>We challenge assumptions before we commit to a solution.</p>
          </article>
          <article className="value-card">
            <span className="mono">02 / CLEAR</span>
            <h3>Make the complex feel simple.</h3>
            <p>Good design helps people understand what matters and what to do next.</p>
          </article>
          <article className="value-card">
            <span className="mono">03 / THOUGHTFUL</span>
            <h3>Details have a job.</h3>
            <p>Every choice should serve the experience, the message, or the moment.</p>
          </article>
          <article className="value-card">
            <span className="mono">04 / OPEN</span>
            <h3>Make together.</h3>
            <p>We invite feedback early and make progress visible throughout the work.</p>
          </article>
          <article className="value-card">
            <span className="mono">05 / PRACTICAL</span>
            <h3>Beautiful and useful.</h3>
            <p>Creative ambition matters most when it works in the real world.</p>
          </article>
          <article className="value-card">
            <span className="mono">06 / CAREFUL</span>
            <h3>Leave things better.</h3>
            <p>We aim to deliver work teams can understand, use, and build on.</p>
          </article>
        </div>

        <div className="section-heading" style={{ marginTop: "100px" }}>
          <div>
            <p className="eyebrow">The people behind the pixels</p>
            <h2>Small team. <em>Long attention spans.</em></h2>
          </div>
          <p className="heading-note">A flexible studio model brings the right creative skills together around each project.</p>
        </div>

        <div className="team-grid">
          <article className="team-card">
            <div className="team-art">
              <svg viewBox="0 0 160 160" aria-hidden="true">
                <circle cx="80" cy="80" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M30 80H130M80 30V130M45 45L115 115M115 45L45 115" stroke="currentColor" opacity=".6" />
                <circle cx="80" cy="80" r="16" fill="#c8ff43" />
              </svg>
            </div>
            <div className="team-meta">
              <h3>Creative direction</h3>
              <p>Strategy & visual systems</p>
            </div>
          </article>
          <article className="team-card">
            <div className="team-art">
              <svg viewBox="0 0 160 160" aria-hidden="true">
                <rect x="36" y="36" width="88" height="88" fill="none" stroke="currentColor" />
                <rect x="52" y="52" width="56" height="56" fill="#c8ff43" />
                <path d="M20 80H140M80 20V140" stroke="currentColor" opacity=".5" />
              </svg>
            </div>
            <div className="team-meta">
              <h3>Product design</h3>
              <p>Research & interaction</p>
            </div>
          </article>
          <article className="team-card">
            <div className="team-art">
              <svg viewBox="0 0 160 160" aria-hidden="true">
                <path d="M80 24L136 128H24Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="80" cy="86" r="25" fill="#c8ff43" />
                <path d="M80 24V128" stroke="currentColor" opacity=".4" />
              </svg>
            </div>
            <div className="team-meta">
              <h3>Brand design</h3>
              <p>Identity & art direction</p>
            </div>
          </article>
          <article className="team-card">
            <div className="team-art">
              <svg viewBox="0 0 160 160" aria-hidden="true">
                <path d="M40 40H120V120H40Z M56 56H104V104H56Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="80" cy="80" r="12" fill="#c8ff43" />
              </svg>
            </div>
            <div className="team-meta">
              <h3>Graphic design</h3>
              <p>Campaigns & visual storytelling</p>
            </div>
          </article>
        </div>

        <p className="team-note">
          The team grid illustrates the studio disciplines, not named individual staff profiles.
        </p>

        <div className="page-cta">
          <div>
            <h2>Good work starts with a good question.</h2>
            <p>Tell us what you&apos;re hoping to make better.</p>
          </div>
          <Link href="/contact" className="button button-dark">
            Start a conversation <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
