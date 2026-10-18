import Link from "next/link";
import { posts } from "./posts";

export const metadata = {
  title: "Insights",
  description:
    "Notes from the Drawtiq studio on design principles, brand systems, product thinking, motion design, and video craft.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          06 / Notes from the studio
        </p>
        <h1>
          Ideas worth<br />
          <em>thinking about.</em>
        </h1>
        <p className="lead">
          Short, honest notes on design, brand, product, motion, and craft — written by the studio between projects.
        </p>
      </section>

      <section className="page-content section-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">All notes</p>
            <h2>
              Fresh from <em>the studio.</em>
            </h2>
          </div>
        </div>

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

        <div className="page-cta">
          <div>
            <h2>Want this thinking on your product?</h2>
            <p>Tell us what you are working on and we will bring the questions.</p>
          </div>
          <Link href="/contact" className="button button-dark">
            Start a project <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
