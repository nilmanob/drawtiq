import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPost, getPublishedPosts } from "@/lib/content/data";
import { formatPostDate } from "@/lib/content/presentation";
import { getPageSeo, pageContent } from "@/lib/content/page-content";

export const revalidate = 60;

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const { data: posts } = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ data: post }, seo] = await Promise.all([
    getPublishedPost(params.slug),
    getPageSeo("insights-detail"),
  ]);

  if (!post) {
    return { title: "Note not found" };
  }

  return {
    title: post.seoTitle || seo.title || `${post.title} — Insights`,
    description: post.seoDescription || seo.description || post.excerpt,
    alternates: { canonical: `/insights/${post.slug}` },
  };
}

export default async function PostPage({ params }: Props) {
  const [{ data: post }, { data: posts }, postPage] = await Promise.all([
    getPublishedPost(params.slug),
    getPublishedPosts(),
    pageContent("insights-detail", "shared", {
      emptyBody: "This note is being prepared. Please check back soon.",
      moreEyebrow: "Keep reading",
      moreHeading: "More studio <em>notes.</em>",
      moreLinkLabel: "All insights",
      cardLinkLabel: "Read the note",
      ctaHeading: "Have a project in mind?",
      ctaBody: "Let's turn a good question into something people love to use.",
      ctaLabel: "Start a project",
      ctaHref: "/contact",
      backLabel: "← Back to all insights",
    }),
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
            <p>{postPage.emptyBody}</p>
          )}
        </section>
      </article>

      {more.length > 0 && (
        <section className="section-wrap post-more">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{postPage.moreEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: postPage.moreHeading }} />
            </div>
            <Link href="/insights" className="text-link">
              {postPage.moreLinkLabel} <span>↗</span>
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
                <span className="insight-link">{postPage.cardLinkLabel} ↗</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="page-cta section-wrap">
        <div>
          <h2>{postPage.ctaHeading}</h2>
          <p>{postPage.ctaBody}</p>
        </div>
        <Link href={postPage.ctaHref} className="button button-dark">
          {postPage.ctaLabel} <span>↗</span>
        </Link>
      </div>

      <p className="section-wrap" style={{ padding: "0 0 90px" }}>
        <Link href="/insights" className="text-link">
          {postPage.backLabel} <span>↗</span>
        </Link>
      </p>
    </main>
  );
}
