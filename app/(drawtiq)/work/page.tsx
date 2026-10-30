import Link from "next/link";
import { PortfolioCard } from "@/components/portfolio-card";
import { getPublishedProjects } from "@/lib/content/data";
import { pageContent, getPageSeo } from "@/lib/content/page-content";
import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("work");
  return pageSeo({
    title: seo.title || "Selected Work",
    description:
      seo.description ||
      "Explore Drawtiq concept projects across UI/UX design, brand identity, and graphic design.",
    alternates: { canonical: "/work" },
  });
}

export default async function WorkPage() {
  const [{ data: projects }, hero, cta, filters] = await Promise.all([
    getPublishedProjects(),
    pageContent("work", "hero", { eyebrow: "01 / Selected work", heading: "Thoughtful work.<br /><em>Made to be used.</em>", lead: "A few projects, shown properly: the brief, the decisions, and the work.", kicker: "SELECTED PROJECTS / 2024—26" }),
    pageContent("work", "cta", { heading: "Have a good idea?", body: "Let's make it work.", label: "Start a project", href: "/contact", disclaimer: "Portfolio projects shown here are illustrative concepts created for this website preview, not claims of commissioned client work." }),
    pageContent("work", "filters", {
      heading: "Selected projects",
      allLabel: "All work",
      categories: [
        { value: "uiux", label: "UI/UX" },
        { value: "branding", label: "Branding" },
        { value: "graphic", label: "Graphic" },
      ],
      emptyText: "New work is being prepared. Check back soon.",
      cardNoteForm: "Everyday objects, considered.",
      cardNoteDefault: "Notes on better work.",
      cardGrowth: "↗ 12.8% this month",
    }),
  ]);

  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          {hero.eyebrow}
        </p>
        <div className="page-intro-row">
          <div className="page-hero-copy">
            <h1 dangerouslySetInnerHTML={{ __html: hero.heading }} />
            <p className="lead">
              {hero.lead}
            </p>
          </div>
           <span className="page-kicker">{hero.kicker}</span>
        </div>
      </section>

      <section className="page-content section-wrap">
        <h2 className="sr-only">{filters.heading}</h2>
        <div className="filter-bar" role="group" aria-label="Filter portfolio projects">
          <button className="filter-btn" data-filter="all" aria-pressed="true">{filters.allLabel}</button>
          {(filters.categories as Array<{ value: string; label: string }>).map((category) => (
            <button
              className="filter-btn"
              key={category.value}
              data-filter={category.value}
              aria-pressed="false"
            >
              {category.label}
            </button>
          ))}
        </div>

        {projects.length > 0 ? (
          <div className="portfolio-grid">
            {projects.map((project) => (
              <PortfolioCard
                key={project.slug}
                project={project}
                labels={{
                  noteForm: filters.cardNoteForm,
                  noteDefault: filters.cardNoteDefault,
                  growth: filters.cardGrowth,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="lead">{filters.emptyText}</p>
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
        <p className="team-note">
          {cta.disclaimer}
        </p>
      </section>
    </main>
  );
}
