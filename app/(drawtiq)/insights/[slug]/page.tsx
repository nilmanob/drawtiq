import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPost, getPublishedPosts } from "@/lib/content/data";
import { formatPostDate } from "@/lib/content/presentation";

export const revalidate = 60;

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const { data: posts } = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: post } = await getPublishedPost(params.slug);

  if (!post) {
    return { title: "Note not found" };
  }

  return {
    title: post.seoTitle || `${post.title} — Insights`,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: `/insights/${post.slug}` },
  };
}

export default async function PostPage({ params }: Props) {
  const [{ data: post }, { data: posts }] = await Promise.all([
    getPublishedPost(params.slug),
    getPublishedPosts(),
  ]);

  if (!post) {
    notFound();
  }

  const more = posts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const date = formatPostDate(post.date);

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
            {date ? <span className="mono">{date}</span> : null}
            {post.readTime ? <span className="mono">{post.readTime}</span> : null}
          </div>
        </section>

        <section className="section-wrap post-body">
          {post.body.length > 0 ? (
            post.body.map((block, index) => {
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
            })
          ) : (
            <p>This note is being prepared. Please check back soon.</p>
          )}
        </section>
      </article>

      {more.length > 0 && (
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
      )}

      <div className="page-cta section-wrap">
        <div>
          <h2>Have a project in mind?</h2>
          <p>Let&apos;s turn a good question into something people love to use.</p>
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
