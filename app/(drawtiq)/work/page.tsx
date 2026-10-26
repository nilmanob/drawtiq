import Link from "next/link";
import { PortfolioCard } from "@/components/portfolio-card";
import { getPublishedProjects } from "@/lib/content/data";

export const revalidate = 60;

export const metadata = {
  title: "Selected Work",
  description:
    "Explore Drawtiq concept projects across UI/UX design, brand identity, and graphic design.",
  alternates: {
    canonical: "/work",
  },
};

export default async function WorkPage() {
  const { data: projects } = await getPublishedProjects();

  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          01 / Selected work
        </p>
        <div className="page-intro-row">
          <div className="page-hero-copy">
            <h1>
              Thoughtful work.
              <br />
              <em>Made to be used.</em>
            </h1>
            <p className="lead">
              A few projects, shown properly: the brief, the decisions, and the work.
            </p>
          </div>
          <span className="page-kicker">SELECTED PROJECTS / 2024—26</span>
        </div>
      </section>

      <section className="page-content section-wrap">
        <h2 className="sr-only">Selected projects</h2>
        <div className="filter-bar" role="group" aria-label="Filter portfolio projects">
          <button className="filter-btn" data-filter="all" aria-pressed="true">All work</button>
          <button className="filter-btn" data-filter="uiux" aria-pressed="false">UI/UX</button>
          <button className="filter-btn" data-filter="branding" aria-pressed="false">Branding</button>
          <button className="filter-btn" data-filter="graphic" aria-pressed="false">Graphic</button>
        </div>

        {projects.length > 0 ? (
          <div className="portfolio-grid">
            {projects.map((project) => (
              <PortfolioCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <p className="lead">New work is being prepared. Check back soon.</p>
        )}

        <div className="page-cta">
          <div>
            <h2>Have a good idea?</h2>
            <p>Let&apos;s make it work.</p>
          </div>
          <Link href="/contact" className="button button-dark">
            Start a project <span>↗</span>
          </Link>
        </div>
        <p className="team-note">
          Portfolio projects shown here are illustrative concepts created for this website preview, not claims of commissioned client work.
        </p>
      </section>
    </main>
  );
}
