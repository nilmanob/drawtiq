import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost } from "../posts";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: "Note not found" };

  return {
    title: `${post.title} — Insights`,
    description: post.excerpt,
    alternates: { canonical: `/insights/${post.slug}` },
  };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function PostPage({ params }: Props) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const more = posts.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <main id="main">
      <article>
        <section className="page-hero section-wrap post-hero">
          <p className="eyebrow">
            <span className="status-dot"></span>
            {post.category}
          </p>
          <h1>{post.title}</h1>
          <p className="lead">{post.excerpt}</p>
          <div className="post-meta">
            <span className="mono">{formatDate(post.date)}</span>
            <span className="mono">{post.readTime}</span>
          </div>
        </section>

        <section className="section-wrap post-body">
          {post.body.map((block, index) => {
            if (block.type === "h2") {
              return <h2 key={index}>{block.text}</h2>;
            }
            if (block.type === "quote") {
              return <blockquote key={index}>{block.text}</blockquote>;
            }
            if (block.type === "list") {
              return (
                <ul key={index}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            return <p key={index}>{block.text}</p>;
          })}
        </section>
      </article>

      <section className="section-wrap post-more">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Keep reading</p>
            <h2>
              More studio <em>notes.</em>
            </h2>
          </div>
          <Link href="/insights" className="text-link">
            All insights <span>↗</span>
          </Link>
        </div>
        <div className="insight-grid">
          {more.map((item) => (
            <Link
              key={item.slug}
              href={`/insights/${item.slug}`}
              className="insight-card"
            >
              <div className={`insight-visual insight-${item.visual}`}>
                <span className="mono">{item.label}</span>
                <div
                  className="note-visual-copy"
                  dangerouslySetInnerHTML={{ __html: item.display }}
                />
              </div>
              <div className="insight-meta">
                <span>{item.category}</span>
                <span>{item.readTime}</span>
              </div>
              <h3>{item.title}</h3>
              <span className="insight-link">Read the note ↗</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="page-cta section-wrap">
        <div>
          <h2>Have a project in mind?</h2>
          <p>Let’s turn a good question into something people love to use.</p>
        </div>
        <Link href="/contact" className="button button-dark">
          Start a project <span>↗</span>
        </Link>
      </div>

      <p className="section-wrap" style={{ padding: "0 0 90px" }}>
        <Link href="/insights" className="text-link">
          ← Back to all insights <span>↗</span>
        </Link>
      </p>
    </main>
  );
}
