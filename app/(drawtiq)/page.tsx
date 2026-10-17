import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main id="main">
      <section className="hero section-wrap">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot"></span>
            Independent design studio · Available for select projects
          </p>
          <h1>
            Make it <span className="headline-outline">meaningful.</span><br />
            Make it <em>move.</em>
          </h1>
          <p className="hero-intro">
            We turn complex ideas into intuitive digital products and distinctive brand experiences.
          </p>
          <div className="hero-actions">
            <Link href="/contact" className="button button-dark">
              Start a project <span>↗</span>
            </Link>
            <Link href="/work" className="text-link">
              Explore selected work <span>↓</span>
            </Link>
          </div>
          <div className="hero-foot">
            <span>Strategy meets craft.</span>
            <span>Scroll to explore ↓</span>
          </div>
        </div>
        <div className="hero-art" aria-label="Abstract Drawtiq design system illustration">
          <div className="art-index mono">DT—001 / BRAND IN MOTION</div>
          <div className="art-grid"></div>
          <div className="art-orbit orbit-one"></div>
          <div className="art-orbit orbit-two"></div>
          <Image
            className="drawn-mark"
            src="data:image/svg+xml,%3Csvg viewBox='0 0 500 470' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%23171916' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M128 90 C220 24 350 83 365 190 C385 308 282 386 174 354 C73 324 47 207 102 124 C160 39 289 63 327 145 C366 231 302 315 224 313 C153 311 112 253 133 194 C152 140 211 122 260 153'/%3E%3Cpath d='M250 72 L250 356 M108 215 L386 215' stroke-dasharray='3 8' opacity='.3'/%3E%3C/svg%3E"
            alt="Drawn geometric D symbol"
            width={500}
            height={470}
            priority
          />
          <div className="art-sticker">
            Ideas<br />into impact<span>✳</span>
          </div>
          <div className="floating-ui ui-top">
            <span className="mini-dot"></span>
            <span>Concept / 04</span>
            <b>Clarity, by design.</b>
          </div>
          <div className="floating-ui ui-bottom">
            <span className="ui-line"></span>
            <span className="mono">FORM FOLLOWS FEELING</span>
            <span className="ui-arrow">↗</span>
          </div>
          <div className="art-caption mono">FIG 01. A SYSTEM OF POSSIBILITY</div>
        </div>
      </section>

      <section className="trust-strip section-wrap" aria-label="Studio principles">
        <span className="eyebrow">Good work comes from</span>
        <div>
          Curiosity <span>✳</span>
        </div>
        <div>
          Clarity <span>✳</span>
        </div>
        <div>
          Craft <span>✳</span>
        </div>
        <div>
          Collaboration <span>✳</span>
        </div>
      </section>

      <section className="work-section section-wrap section-pad" id="work">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / Selected work</p>
            <h2>
              Thoughtful work.<br />
              <em>Real-world purpose.</em>
            </h2>
          </div>
          <Link href="#contact" className="text-link">
            Have a project in mind? <span>↗</span>
          </Link>
        </div>
        <div className="work-grid">
          <a
            className="project project-large reveal"
            href="#contact"
            aria-label="Discuss a fintech project"
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
                  <path
                    d="M0 110 C40 96 45 112 80 76 S130 88 165 53 S230 76 270 38 S330 63 370 24 S435 36 500 8 L500 140 L0 140Z"
                    fill="#c8ff43"
                    opacity=".08"
                  />
                </svg>
                <div className="mock-bottom">
                  <span>Cash flow</span>
                  <span>Activity</span>
                  <span>Insights</span>
                </div>
              </div>
              <div className="fintech-orb"></div>
              <span className="visual-label mono">PRODUCT DESIGN / 2025</span>
            </div>
            <div className="project-meta">
              <div>
                <p className="eyebrow">Fintech · Digital product</p>
                <h3>Northstar Finance</h3>
                <p>Making money feel a little more human.</p>
              </div>
              <span className="round-arrow">↗</span>
            </div>
          </a>

          <a className="project project-small reveal" href="#contact" aria-label="Discuss a brand identity project">
            <div className="project-visual visual-bloom">
              <div className="bloom-card">
                <span className="bloom-symbol">b.</span>
                <span className="bloom-name">bloomwell</span>
                <span className="bloom-sub">A softer kind of wellness.</span>
                <div className="bloom-petal petal-a"></div>
                <div className="bloom-petal petal-b"></div>
              </div>
              <span className="visual-label mono">IDENTITY / 2025</span>
            </div>
            <div className="project-meta">
              <div>
                <p className="eyebrow">Wellness · Brand identity</p>
                <h3>Bloomwell</h3>
                <p>A brighter identity for everyday wellbeing.</p>
              </div>
              <span className="round-arrow">↗</span>
            </div>
          </a>

          <a className="project project-small reveal" href="#contact" aria-label="Discuss an e-commerce design project">
            <div className="project-visual visual-form">
              <div className="form-package">
                <span>FORM / OBJECT</span>
                <strong>Less, but<strong>better.</strong></strong>
                <div className="form-circle"></div>
                <small>Everyday objects, considered.</small>
              </div>
              <span className="visual-label mono">ART DIRECTION / 2024</span>
            </div>
            <div className="project-meta">
              <div>
                <p className="eyebrow">E-commerce · Art direction</p>
                <h3>Form & Object</h3>
                <p>Giving useful things a point of view.</p>
              </div>
              <span className="round-arrow">↗</span>
            </div>
          </a>

          <a
            className="project project-large reveal"
            href="#contact"
            aria-label="Discuss a SaaS dashboard project"
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
              <span className="visual-label mono">UX / SAAS PLATFORM</span>
            </div>
            <div className="project-meta">
              <div>
                <p className="eyebrow">SaaS · Product experience</p>
                <h3>Orbit Workspace</h3>
                <p>Less admin. More momentum.</p>
              </div>
              <span className="round-arrow">↗</span>
            </div>
          </a>
        </div>
        <div className="work-bottom">
          <span className="mono">MORE GOOD THINGS ARE IN THE MAKING.</span>
          <a href="#contact" className="text-link">
            Let’s make yours next <span>↗</span>
          </a>
        </div>
      </section>

      <section className="services-section section-wrap" id="services">
        <div className="section-wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / What we do</p>
              <h2>
                Good thinking.<br />
                <em>Beautifully made.</em>
              </h2>
            </div>
            <p className="heading-note">
              From first sketch to final pixel, we bring strategy and craft together to make every interaction count.
            </p>
          </div>
          <div className="service-list">
            <article className="service-row reveal">
              <span className="service-number mono">01</span>
              <div className="service-icon icon-ux">↗</div>
              <div className="service-title">
                <h3>UI/UX Design</h3>
                <p>Make every interaction feel effortless.</p>
              </div>
              <div className="service-detail">Research · User journeys · Wireframes · Prototyping · Usability</div>
              <span className="service-arrow">↗</span>
            </article>
            <article className="service-row reveal">
              <span className="service-number mono">02</span>
              <div className="service-icon icon-product">◫</div>
              <div className="service-title">
                <h3>Digital Product Design</h3>
                <p>Complex tools, clear experiences.</p>
              </div>
              <div className="service-detail">SaaS · Web apps · Mobile apps · Design systems</div>
              <span className="service-arrow">↗</span>
            </article>
            <article className="service-row reveal">
              <span className="service-number mono">03</span>
              <div className="service-icon icon-brand">✳</div>
              <div className="service-title">
                <h3>Brand Identity</h3>
                <p>Look like you mean it.</p>
              </div>
              <div className="service-detail">Strategy · Naming direction · Identity · Guidelines</div>
              <span className="service-arrow">↗</span>
            </article>
            <article className="service-row reveal">
              <span className="service-number mono">04</span>
              <div className="service-icon icon-graphic">Aa</div>
              <div className="service-title">
                <h3>Graphic Design</h3>
                <p>Ideas with a visual point of view.</p>
              </div>
              <div className="service-detail">Campaigns · Packaging · Editorial · Social · Print</div>
              <span className="service-arrow">↗</span>
            </article>
          </div>
          <div className="service-note">
            <span className="drawn-underline">Small details. Bigger picture.</span>
            <span className="mono">STRATEGY × DESIGN × DELIVERY</span>
          </div>
        </div>
      </section>

      <section className="process-section section-wrap section-pad">
        <div className="section-heading">
          <div>
            <p className="eyebrow">03 / How we work</p>
            <h2>
              Clear process.<br />
              <em>Room for magic.</em>
            </h2>
          </div>
          <p className="heading-note">
            A thoughtful, collaborative process gets the right people around the right problem—then makes progress visible.
          </p>
        </div>
        <div className="process-track">
          <div className="process-line"><span></span></div>
          <article className="process-step reveal">
            <span className="step-index">01</span>
            <div className="step-symbol">⌕</div>
            <h3>Discover</h3>
            <p>We ask better questions, listen closely, and get to the heart of what matters.</p>
            <span className="mono">LISTEN FIRST</span>
          </article>
          <article className="process-step reveal">
            <span className="step-index">02</span>
            <div className="step-symbol">⌗</div>
            <h3>Define</h3>
            <p>We align on the opportunity, map the direction, and make a plan with purpose.</p>
            <span className="mono">FIND THE FOCUS</span>
          </article>
          <article className="process-step reveal">
            <span className="step-index">03</span>
            <div className="step-symbol">✳</div>
            <h3>Design</h3>
            <p>We explore, test, and refine until the idea feels both right and remarkably clear.</p>
            <span className="mono">MAKE IT MATTER</span>
          </article>
          <article className="process-step reveal">
            <span className="step-index">04</span>
            <div className="step-symbol">↗</div>
            <h3>Deliver</h3>
            <p>We hand over thoughtful, ready-to-use work—and help it find its place in the world.</p>
            <span className="mono">BUILT TO MOVE</span>
          </article>
        </div>
      </section>

      <section className="studio-section" id="studio">
        <div className="section-wrap studio-grid">
          <div className="studio-art">
            <div className="studio-paper">
              <span className="mono">DRAWING NO. 008</span>
              <svg viewBox="0 0 400 400" aria-hidden="true">
                <path d="M70 200 C70 70 330 70 330 200 S70 330 70 200Z" fill="none" stroke="currentColor" stroke-width="2" />
                <path d="M120 200 C120 120 280 120 280 200 S120 280 120 200Z" fill="none" stroke="currentColor" stroke-width="2" />
                <path d="M200 70V330M70 200H330" stroke="currentColor" stroke-dasharray="3 7" opacity=".4" />
                <circle cx="200" cy="200" r="12" fill="var(--accent)" />
              </svg>
              <span className="mono">FORM / FUNCTION / FEELING</span>
            </div>
            <div className="studio-stamp">A little<br />more thought<br />goes a long way.</div>
          </div>
          <div className="studio-copy">
            <p className="eyebrow">04 / The studio</p>
            <h2>
              Not just how it looks.<br />
              <em>How it works.</em>
            </h2>
            <p className="studio-lead">
              We believe great design should make you feel something—and make something better.
            </p>
            <p>
              Drawtiq brings strategic thinking, curious minds, and considered craft to the same table. We partner closely with ambitious teams to find the signal in the noise and build experiences people genuinely want to use.
            </p>
            <p>No design theatre. No decoration for decoration’s sake. Just good questions, clear decisions, and work made with care.</p>
            <a href="#contact" className="text-link">A little about our approach <span>↗</span></a>
            <div className="studio-values">
              <div>
                <b>01</b>
                <span>Curiosity before assumptions</span>
              </div>
              <div>
                <b>02</b>
                <span>Clarity over complexity</span>
              </div>
              <div>
                <b>03</b>
                <span>Craft in every detail</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="quote-section section-wrap section-pad">
        <p className="eyebrow">05 / A good partnership</p>
        <div className="quote-mark">“</div>
        <blockquote>
          Drawtiq made the complicated feel <em>obvious.</em> The kind of design that makes you wonder why it was ever any other way.
        </blockquote>
        <div className="quote-credit">
          <span className="quote-avatar">A</span>
          <div>
            <b>A note from a happy collaborator</b>
            <span>Client testimonial placeholder · Replace with approved feedback</span>
          </div>
          <span className="mono">WORDS THAT MATTER</span>
        </div>
        <p className="quote-disclaimer">This is placeholder copy for the design preview. Replace it with a verified client testimonial before launch.</p>
      </section>

      <section className="insights-section section-wrap section-pad" id="insights">
        <div className="section-heading">
          <div>
            <p className="eyebrow">06 / Notes from the studio</p>
            <h2>
              Ideas worth<br />
              <em>thinking about.</em>
            </h2>
          </div>
          <Link href="#contact" className="text-link">
            More studio notes <span>↗</span>
          </Link>
        </div>
        <div className="insight-grid">
          <a className="insight-card reveal" href="#contact">
            <div className="insight-visual insight-one">
              <span className="mono">FIELD NOTES / 001</span>
              <div className="insight-letters">Less,<br /><em>but better.</em></div>
              <span className="insight-shape"></span>
            </div>
            <div className="insight-meta">
              <span>Design principles</span>
              <span>5 min read</span>
            </div>
            <h3>Clarity is a feature, not a finishing touch.</h3>
            <span className="insight-link">Read the note ↗</span>
          </a>
          <a className="insight-card reveal" href="#contact">
            <div className="insight-visual insight-two">
              <span className="mono">FIELD NOTES / 002</span>
              <div className="type-grid">
                <b>Aa</b>
                <b>Gg</b>
                <b>Rr</b>
                <b>01</b>
              </div>
              <span className="type-caption">A system is a promise.</span>
            </div>
            <div className="insight-meta">
              <span>Brand systems</span>
              <span>7 min read</span>
            </div>
            <h3>Consistency doesn’t have to mean predictable.</h3>
            <span className="insight-link">Read the note ↗</span>
          </a>
          <a className="insight-card reveal" href="#contact">
            <div className="insight-visual insight-three">
              <span className="mono">FIELD NOTES / 003</span>
              <div className="loop-shape">↗</div>
              <div className="loop-copy">Make space<br />for better<br />questions.</div>
            </div>
            <div className="insight-meta">
              <span>Product thinking</span>
              <span>4 min read</span>
            </div>
            <h3>The best interface is built on a better question.</h3>
            <span className="insight-link">Read the note ↗</span>
          </a>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="section-wrap contact-grid">
          <div className="contact-copy">
            <p className="eyebrow">
              <span className="status-dot"></span>
              07 / Your turn
            </p>
            <h2>
              Have a good idea?<br />
              <em>Let’s make it matter.</em>
            </h2>
            <p>Tell us what you’re working on. We’ll bring the questions, the thinking, and the craft to help move it forward.</p>
            <a className="contact-email" href="mailto:hello@drawtiq.studio">
              hello@drawtiq.studio <span>↗</span>
            </a>
            <div className="contact-note mono">NEW PROJECTS · SELECT AVAILABILITY</div>
          </div>
          <form className="contact-form" id="project-form">
            <div className="form-heading">
              <span className="mono">PROJECT INQUIRY / 001</span>
              <span>We usually reply within 2 business days.</span>
            </div>
            <label>Your name
              <input name="name" autoComplete="name" placeholder="How should we call you?" required />
            </label>
            <label>Email address
              <input name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
            </label>
            <label>What do you need?
              <select name="service" required>
                <option value="" disabled selected>Select a service</option>
                <option>UI/UX & Product Design</option>
                <option>Brand Identity</option>
                <option>Graphic Design</option>
                <option>Website Design</option>
                <option>A bit of everything</option>
              </select>
            </label>
            <label>A little about the project
              <textarea name="message" rows={3} placeholder="The idea, the challenge, the big ambition…" required />
            </label>
            <button className="button button-accent form-submit" type="submit">
              Prepare email <span>↗</span>
            </button>
            <p className="form-hint" id="form-hint">
              This form opens your email app with the details ready to send.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
