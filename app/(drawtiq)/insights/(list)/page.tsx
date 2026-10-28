import Link from "next/link";
import { getPublishedPosts } from "@/lib/content/data";
import { getPageSeo, pageContent } from "@/lib/content/page-content";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("insights");
  return {
    title: seo.title || "Insights",
    description:
      seo.description ||
      "Notes from the Drawtiq studio on design principles, brand systems, product thinking, motion design, and video craft.",
    alternates: { canonical: "/insights" },
  };
}

export default async function InsightsPage() {
  const [{ data: posts }, hero, listHeading, cta] = await Promise.all([
    getPublishedPosts(),
    pageContent("insights", "hero", {
      eyebrow: "06 / Notes from the studio",
      heading: "Notes from<br /><em>the work.</em>",
      lead: "What we're learning about design, product, and the small decisions that change the outcome.",
    }),
    pageContent("insights", "list", {
      eyebrow: "All notes",
      heading: "Recent <em>notes.</em>",
      emptyText: "New studio notes are on the way. Check back soon.",
      cardLinkLabel: "Read the note",
    }),
    pageContent("insights", "cta", {
      heading: "Want this thinking on your product?",
      body: "Tell us what you're working on and we'll bring the questions.",
      label: "Start a project",
      href: "/contact",
    }),
  ]);

  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          {hero.eyebrow}
        </p>
        <h1 dangerouslySetInnerHTML={{ __html: hero.heading }} />
        <p className="lead">{hero.lead}</p>
      </section>

      <section className="page-content section-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{listHeading.eyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: listHeading.heading }} />
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="insight-grid">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/insights/${post.slug}`}
                className="insight-card reveal"
              >
                <div className={`insight-visual insight-${post.visual}`}>
                  <span className="mono">{post.label}</span>
                  {post.visual === "one" && <span className="insight-shape"></span>}
                  <div
                    className="note-visual-copy"
                    dangerouslySetInnerHTML={{ __html: post.display }}
                  />
                </div>
                <div className="insight-meta">
                  <span>{post.category}</span>
                  <span>{post.readTime}</span>
                </div>
                <h3>{post.title}</h3>
                <span className="insight-link">{listHeading.cardLinkLabel} ↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="lead">{listHeading.emptyText}</p>
        )}

        <div className="page-cta">
          <div>
            <h2>{cta.heading}</h2>
            <p>{cta.body}</p>
          </div>
          <Link href={cta.href} className="button button-dark">
            {cta.label} <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
