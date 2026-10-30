import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyVisual } from "@/components/case-study-visual";
import { getPublishedProject } from "@/lib/content/data";
import { getPageSeo, pageContent } from "@/lib/content/page-content";
import { pageSeo } from "@/lib/seo";
import { breadcrumbJsonLd, caseStudyJsonLd, JsonLd } from "@/components/json-ld";

export const revalidate = 60;

type Props = {
  params: { project: string };
};

const CASE_STUDY_FALLBACK = {
  projectTypeLabel: "PROJECT TYPE",
  projectType: "Illustrative concept",
  categoryFallback: "Case study",
  metaDisciplineLabel: "DISCIPLINE",
  metaIndustryLabel: "INDUSTRY",
  metaScopeLabel: "SCOPE",
  challengeEyebrow: "01 / The challenge",
  challengeHeading: "Find the signal in the noise.",
  challengeFallback:
    "This concept explores how a clearer hierarchy, a calmer visual language, and a more considered flow can make a complex experience feel easier to understand.",
  challengeExtra:
    "The experience needed to help people make sense of dense information without making the product feel simplistic. The challenge was to establish a clear hierarchy while keeping meaningful depth close at hand.",
  approachEyebrow: "02 / The approach",
  approachHeading: "Start with the human question.",
  approachFallback:
    "We organized the experience around the questions a user arrives with: Where do I stand? What changed? What should I look at next?",
  approachHighlights: [
    "Give the most important information a clear visual priority.",
    "Use consistent patterns for summaries, trends, and supporting details.",
    "Make key actions easy to scan and understand.",
    "Use color as a functional cue, not decoration.",
  ],
  solutionEyebrow: "03 / The solution",
  solutionHeading: "Clarity built into the system.",
  solutionFallback:
    "A considered type scale, restrained palette, modular cards, and simple chart language create a more coherent product experience. Responsive layouts keep the hierarchy intact as the available space changes.",
  stats: [
    { number: "01", label: "Clear primary summary" },
    { number: "02", label: "Consistent data patterns" },
    { number: "03", label: "Focused next steps" },
  ],
  outcomeEyebrow: "04 / The outcome",
  outcomeHeading: "Designed for better decisions.",
  outcomeFallback:
    "This is a design concept, so there are no verified client performance results or before-and-after metrics to report. In a live engagement, the next step would be to validate the experience with usability testing and measure task completion, comprehension, and confidence.",
  disclaimer:
    "All names, screens, and results on this page are illustrative concept material—not commissioned client work or measured outcomes.",
  ctaHeading: "Have a similar challenge?",
  ctaBody: "Let's shape a thoughtful solution around your users and goals.",
  ctaLabel: "Start a project",
  ctaHref: "/contact",
  backLabel: "← Back to all work",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ data: project }, seo] = await Promise.all([
    getPublishedProject(params.project),
    getPageSeo("case-studies"),
  ]);

  if (!project) {
    return { title: "Case Study not found" };
  }

  const description =
    project.seoDescription ||
    seo.description ||
    `Design concept for ${project.title}. ${project.lead ?? project.summary ?? ""}`.trim();

  return pageSeo({
    title: project.seoTitle || seo.title || `${project.title} — Case Study`,
    description,
    alternates: { canonical: `/case-study/${project.slug}` },
  });
}

export default async function CaseStudyPage({ params }: Props) {
  const [{ data: project }, copy] = await Promise.all([
    getPublishedProject(params.project),
    pageContent("case-studies", "shared", CASE_STUDY_FALLBACK),
  ]);

  if (!project) {
    notFound();
  }

  const lead = project.lead ?? project.summary ?? "";
  const challenge = project.challenge || copy.challengeFallback;
  const approach = project.approach || copy.approachFallback;
  const solution = project.solution || copy.solutionFallback;
  const outcome = project.outcome || copy.outcomeFallback;

  return (
    <main id="main">
      <JsonLd
        data={[
          caseStudyJsonLd({
            slug: project.slug,
            title: project.title,
            description: lead,
            category: project.category,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Work", path: "/work" },
            { name: project.title, path: `/case-study/${project.slug}` },
          ]),
        ]}
      />
      <section className="page-hero section-wrap detail-hero">
        <p className="eyebrow">
          <span className="status-dot"></span>
          {project.category ?? copy.categoryFallback}
        </p>
        <h1 id="case-title" data-reveal data-reveal-delay="0.05">
          {project.title}
          {project.subtitle ? (
            <>
              <br />
              <em>{project.subtitle}</em>
            </>
          ) : null}
        </h1>
        <p className="lead" id="case-lead" data-reveal data-reveal-delay="0.15">
          {lead}
        </p>
        <div className="case-meta">
          <div>
            <span className="mono">{copy.metaDisciplineLabel}</span>
            <strong id="case-discipline">{project.discipline ?? "—"}</strong>
          </div>
          <div>
            <span className="mono">{copy.metaIndustryLabel}</span>
            <strong id="case-industry">{project.industry ?? "—"}</strong>
          </div>
          <div>
            <span className="mono">{copy.metaScopeLabel}</span>
            <strong id="case-scope">{project.scope ?? "—"}</strong>
          </div>
          <div>
            <span className="mono">{copy.projectTypeLabel}</span>
            <strong>{copy.projectType}</strong>
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <CaseStudyVisual project={project} />
      </section>

      <section className="section-wrap">
        <div className="case-story">
          <div>
            <p className="eyebrow">{copy.challengeEyebrow}</p>
            <h2 id="case-problem-title" data-reveal data-reveal-delay="0.2">{copy.challengeHeading}</h2>
            <p id="case-challenge" data-reveal data-reveal-delay="0.25">
              {challenge}
            </p>
          </div>
          <div>
            <p>
              {copy.challengeExtra}
            </p>
          </div>
        </div>
        <div className="case-story">
          <div>
            <p className="eyebrow">{copy.approachEyebrow}</p>
            <h2 id="case-approach" data-reveal data-reveal-delay="0.3">{copy.approachHeading}</h2>
            <p id="case-approach">{approach}</p>
            {!project.approach && (
              <ul>
                {(copy.approachHighlights as string[]).map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="case-story">
          <div>
            <p className="eyebrow">{copy.solutionEyebrow}</p>
            <h2 id="case-solution" data-reveal data-reveal-delay="0.35">{copy.solutionHeading}</h2>
            <p>{solution}</p>
            <div className="case-stats">
              {(copy.stats as Array<{ number: string; label: string }>).map((stat) => (
                <div className="case-stat" key={stat.number}>
                  <strong>{stat.number}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="case-story">
          <div>
            <p className="eyebrow">{copy.outcomeEyebrow}</p>
            <h2 id="case-outcome" data-reveal data-reveal-delay="0.4">{copy.outcomeHeading}</h2>
            <p>{outcome}</p>
            <p className="team-note">
              {copy.disclaimer}
            </p>
          </div>
        </div>
      </section>

      <div className="page-cta">
        <div>
          <h2 data-reveal data-reveal-delay="0.45">{copy.ctaHeading}</h2>
          <p>{copy.ctaBody}</p>
        </div>
        <Link href={copy.ctaHref} className="button button-dark">
          {copy.ctaLabel} <span>↗</span>
        </Link>
      </div>
      <p style={{ padding: "40px 0" }}>
        <Link href="/work" className="text-link" data-reveal data-reveal-delay="0.5">
          {copy.backLabel} <span>↗</span>
        </Link>
      </p>
    </main>
  );
}
