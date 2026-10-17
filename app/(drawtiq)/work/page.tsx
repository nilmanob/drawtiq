import Link from "next/link";

export const metadata = {
  title: "Selected Work | Drawtiq",
  description:
    "Explore Drawtiq concept projects across UI/UX design, brand identity, and graphic design.",
  alternates: {
    canonical: "/work",
  },
};

export default function WorkPage() {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          01 / Selected work
        </p>
        <div className="page-intro-row">
          <div className="page-hero-copy">
            <h1>Thoughtful work.<br /><em>Real-world purpose.</em></h1>
            <p className="lead">
              A collection of design explorations built around clarity, character, and the details that make an experience feel right.
            </p>
          </div>
          <span className="page-kicker">SELECTED PROJECTS / 2024—26</span>
        </div>
      </section>

      <section className="page-content section-wrap">
        <div className="filter-bar" role="group" aria-label="Filter portfolio projects">
          <button className="filter-btn" data-filter="all" aria-pressed="true">All work</button>
          <button className="filter-btn" data-filter="uiux" aria-pressed="false">UI/UX</button>
          <button className="filter-btn" data-filter="branding" aria-pressed="false">Branding</button>
          <button className="filter-btn" data-filter="graphic" aria-pressed="false">Graphic</button>
        </div>

        <div className="portfolio-grid">
          <a
            className="project project-large reveal"
            data-category="uiux"
            href="case-study.html?project=northstar"
          >
            <div className="project-visual visual-fintech">
              <div className="mock-window">
                <div className="mock-top">
                  <b>northstar</b>
                  <span>•••</span>
                </div>
                <div className="mock-balance">
                  <small>Total balance</small>
                  <strong>$248,590.00</strong>
                  <span className="growth">↗ 12.8% this month</span>
                </div>
                <svg viewBox="0 0 500 140" preserveAspectRatio="none">
                  <path
                    d="M0 110 C40 96 45 112 80 76 S130 88 165 53 S230 76 270 38 S330 63 370 24 S435 36 500 8"
                    fill="none"
                    stroke="#c8ff43"
                    stroke-width="3"
                  />
                </svg>
                <div className="mock-bottom">
                  <span>Cash flow</span>
                  <span>Activity</span>
                  <span>Insights</span>
                </div>
              </div>
              <div className="fintech-orb"></div>
              <span className="visual-label mono">PRODUCT DESIGN / CONCEPT</span>
            </div>
            <div className="project-meta">
              <div>
                <p className="eyebrow">Fintech · UI/UX</p>
                <h3>Northstar Finance</h3>
                <p>Making money feel a little more human.</p>
              </div>
              <span className="round-arrow">↗</span>
            </div>
          </a>

          <a className="project project-small reveal" data-category="branding" href="case-study.html?project=bloomwell">
            <div className="project-visual visual-bloom">
              <div className="bloom-card">
                <span className="bloom-symbol">b.</span>
                <span className="bloom-name">bloomwell</span>
                <span className="bloom-sub">A softer kind of wellness.</span>
                <div className="bloom-petal petal-a"></div>
                <div className="bloom-petal petal-b"></div>
              </div>
              <span className="visual-label mono">IDENTITY / CONCEPT</span>
            </div>
            <div className="project-meta">
              <div>
                <p className="eyebrow">Wellness · Branding</p>
                <h3>Bloomwell</h3>
                <p>A brighter identity for everyday wellbeing.</p>
              </div>
              <span className="round-arrow">↗</span>
            </div>
          </a>

          <a className="project project-small reveal" data-category="graphic" href="case-study.html?project=form-object">
            <div className="project-visual visual-form">
              <div className="form-package">
                <span>FORM / OBJECT</span>
                <strong>Less, but<strong>better.</strong></strong>
                <div className="form-circle"></div>
                <small>Everyday objects, considered.</small>
              </div>
              <span className="visual-label mono">ART DIRECTION / CONCEPT</span>
            </div>
            <div className="project-meta">
              <div>
                <p className="eyebrow">E-commerce · Graphic</p>
                <h3>Form & Object</h3>
                <p>Giving useful things a point of view.</p>
              </div>
              <span className="round-arrow">↗</span>
            </div>
          </a>

          <a
            className="project project-large reveal"
            data-category="uiux"
            href="case-study.html?project=orbit"
          >
            <div className="project-visual visual-orbit">
              <div className="orbit-panel">
                <div className="orbit-sidebar">
                  <b>orbit.</b>
                  <span>Overview</span>
                  <span>Projects</span>
                  <span>Reports</span>
                  <span>Settings</span>
                </div>
                <div className="orbit-main">
                  <small>MONDAY, OCTOBER 12</small>
                  <h4>Your team, in sync.</h4>
                  <div className="orbit-stats">
                    <div>
                      <small>Active projects</small>
                      <b>18</b>
                    </div>
                    <div>
                      <small>Team velocity</small>
                      <b>+24%</b>
                    </div>
                    <div>
                      <small>On track</small>
                      <b>92%</b>
                    </div>
                  </div>
                  <div className="orbit-chart">
                    <i style={{ height: "32%" }}></i>
                    <i style={{ height: "48%" }}></i>
                    <i style={{ height: "39%" }}></i>
                    <i style={{ height: "63%" }}></i>
                    <i style={{ height: "55%" }}></i>
                    <i style={{ height: "78%" }}></i>
                    <i style={{ height: "67%" }}></i>
                    <i style={{ height: "92%" }}></i>
                    <i style={{ height: "72%" }}></i>
                    <i style={{ height: "100%" }}></i>
                  </div>
                </div>
              </div>
              <div className="orbit-shape"></div>
              <span className="visual-label mono">SAAS / CONCEPT</span>
            </div>
            <div className="project-meta">
              <div>
                <p className="eyebrow">SaaS · UI/UX</p>
                <h3>Orbit Workspace</h3>
                <p>Less admin. More momentum.</p>
              </div>
              <span className="round-arrow">↗</span>
            </div>
          </a>

          <a className="project project-small reveal" data-category="branding" href="case-study.html?project=goodkind">
            <div className="project-visual visual-bloom" style={{ background: "#e8d7c6" }}>
              <div className="bloom-card" style={{ background: "#f9eee2" }}>
                <span className="bloom-symbol" style={{ color: "#b2674b" }}>g.</span>
                <span className="bloom-name">goodkind</span>
                <span className="bloom-sub">Care, made visible.</span>
              </div>
              <span className="visual-label mono">BRAND SYSTEM / CONCEPT</span>
            </div>
            <div className="project-meta">
              <div>
                <p className="eyebrow">Community · Branding</p>
                <h3>Goodkind</h3>
                <p>A warmer voice for a purpose-led brand.</p>
              </div>
              <span className="round-arrow">↗</span>
            </div>
          </a>

          <a className="project project-small reveal" data-category="graphic" href="case-study.html?project=field-notes">
            <div className="project-visual visual-form" style={{ background: "#d6dfd2" }}>
              <div className="form-package" style={{ background: "#f5f3ed" }}>
                <span>FIELD NOTES / 006</span>
                <strong>Make room<strong>to think.</strong></strong>
                <div className="form-circle"></div>
                <small>Notes on better work.</small>
              </div>
              <span className="visual-label mono">EDITORIAL / CONCEPT</span>
            </div>
            <div className="project-meta">
              <div>
                <p className="eyebrow">Editorial · Graphic</p>
                <h3>Field Notes</h3>
                <p>A visual language for ideas in progress.</p>
              </div>
              <span className="round-arrow">↗</span>
            </div>
          </a>
        </div>

        <div className="page-cta">
          <div>
            <h2>Have a good idea?</h2>
            <p>Let's make it matter.</p>
          </div>
          <Link href="/contact" className="button button-dark">
            Start a project <span>↗</span>
          </Link>
        </div>
        <p className="team-note">
          Portfolio projects shown here are illustrative concepts created for this website preview, not claims of commissioned client work.
        </p>
      </section>
    </main>
  );
}
