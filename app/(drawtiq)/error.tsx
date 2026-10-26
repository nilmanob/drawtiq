"use client";

import Link from "next/link";

export default function ContentError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          Something went wrong
        </p>
        <h1>
          We couldn&apos;t load <em>this page.</em>
        </h1>
        <p className="lead">
          The content service is temporarily unavailable. Please try again, or go back to the main site.
        </p>
        <div className="hero-actions" style={{ marginTop: "30px" }}>
          <button className="button button-dark" type="button" onClick={() => reset()}>
            Try again <span>↗</span>
          </button>
          <Link href="/" className="text-link">
            Back to home <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
