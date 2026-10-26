import Link from "next/link";
import { notFound } from "next/navigation";
import { Faq } from "@/components/faq";
import { getPublishedServiceDetail } from "@/lib/content/data";

export async function ServiceDetailPage({ routeSlug }: { routeSlug: string }) {
  const { data: detail } = await getPublishedServiceDetail(routeSlug);

  if (!detail) {
    notFound();
  }

  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          {detail.number} / Service detail
        </p>
        <h1>{detail.heroTitle}</h1>
        <p className="lead">{detail.lead}</p>
        <div className="hero-actions" style={{ marginTop: "30px" }}>
          <Link href="/contact" className="button button-dark">
            Start a project <span>↗</span>
          </Link>
          <Link href="#deliverables" className="text-link">
            Explore deliverables <span>↓</span>
          </Link>
        </div>
      </section>

      {detail.visual === "motion" && (
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
      )}

      {detail.visual === "video" && (
        <section className="section-wrap">
          <div className="service-visual visual-video">
            <div className="video-preview">
              <span className="video-play">▶</span>
              <div className="video-lines">
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>
            <div className="video-timeline">
              <span className="video-track-head mono">TIMELINE</span>
              <div className="video-track">
                <span className="clip clip-a"></span>
                <span className="clip clip-b"></span>
                <span className="clip clip-c"></span>
                <span className="playhead"></span>
              </div>
              <div className="video-track thin">
                <span className="clip clip-d"></span>
                <span className="clip clip-e"></span>
              </div>
            </div>
            <span className="visual-label mono">POST-PRODUCTION / DRAWTIQ</span>
          </div>
        </section>
      )}

      <section className="page-content section-wrap">
        <div className="service-detail-grid">
          <div className="service-detail-copy">
            <p className="eyebrow">How we approach it</p>
            <h2>
              {detail.introHeadingPrefix} <em>{detail.introHeadingEmphasis}</em>
            </h2>
            {detail.introParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <Link href={detail.exploreHref} className="text-link">
              {detail.exploreLabel} <span>↗</span>
            </Link>
          </div>
          <div id="deliverables">
            <p className="eyebrow">{detail.sectionLabel}</p>
            <div className="deliverables">
              {detail.deliverables.map((item, index) => (
                <article className="deliverable" key={`${item.title}-${index}`}>
                  <span className="mono">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    {item.body ? <p>{item.body}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="service-pair">
          {detail.pair.map((item) => (
            <article className="service-panel" key={item.number}>
              <span className="mono">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>

        <div className="section-heading" style={{ marginTop: "100px" }}>
          <div>
            <p className="eyebrow">A few common questions</p>
            <h2>
              Good to <em>know.</em>
            </h2>
          </div>
        </div>

        <Faq items={detail.faqs} />

        <div className="page-cta">
          <div>
            <h2>{detail.cta.heading}</h2>
            <p>{detail.cta.body}</p>
          </div>
          <Link href={detail.cta.href} className="button button-dark">
            {detail.cta.label} <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
