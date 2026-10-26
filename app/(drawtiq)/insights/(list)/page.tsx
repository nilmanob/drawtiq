import Link from "next/link";
import { getPublishedPosts } from "@/lib/content/data";

export const revalidate = 60;

export const metadata = {
  title: "Insights",
  description:
    "Notes from the Drawtiq studio on design principles, brand systems, product thinking, motion design, and video craft.",
  alternates: { canonical: "/insights" },
};

export default async function InsightsPage() {
  const { data: posts } = await getPublishedPosts();

  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          06 / Notes from the studio
        </p>
        <h1>
          Notes from
          <br />
          <em>the work.</em>
        </h1>
        <p className="lead">
          What we&apos;re learning about design, product, and the small decisions that change the outcome.
        </p>
      </section>

      <section className="page-content section-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">All notes</p>
            <h2>
              Recent <em>notes.</em>
            </h2>
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
                <span className="insight-link">Read the note ↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="lead">New studio notes are on the way. Check back soon.</p>
        )}

        <div className="page-cta">
          <div>
            <h2>Want this thinking on your product?</h2>
            <p>Tell us what you&apos;re working on and we&apos;ll bring the questions.</p>
          </div>
          <Link href="/contact" className="button button-dark">
            Start a project <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
