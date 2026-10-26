import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          404 / Page not found
        </p>
        <h1>
          This page isn&apos;t <em>here.</em>
        </h1>
        <p className="lead">
          The content may have moved, or it may not be published yet. Browse the work or head back to the studio.
        </p>
        <div className="hero-actions" style={{ marginTop: "30px" }}>
          <Link href="/work" className="button button-dark">
            View selected work <span>↗</span>
          </Link>
          <Link href="/insights" className="text-link">
            Read the insights <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
