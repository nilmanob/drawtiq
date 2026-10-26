export function PublicContentLoading({ label }: { label: string }) {
  return (
    <main id="main" aria-busy="true">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          {label}
        </p>
        <h1>
          Gathering the <em>details.</em>
        </h1>
        <p className="lead">Loading the latest from the studio.</p>
      </section>
    </main>
  );
}
