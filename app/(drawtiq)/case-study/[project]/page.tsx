import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyVisual } from "@/components/case-study-visual";
import { getPublishedProject } from "@/lib/content/data";

export const revalidate = 60;

type Props = {
  params: { project: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: project } = await getPublishedProject(params.project);

  if (!project) {
    return { title: "Case Study not found" };
  }

  const description =
    project.seoDescription ||
    `Design concept for ${project.title}. ${project.lead ?? project.summary ?? ""}`.trim();

  return {
    title: project.seoTitle || `${project.title} — Case Study`,
    description,
    alternates: { canonical: `/case-study/${project.slug}` },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { data: project } = await getPublishedProject(params.project);

  if (!project) {
    notFound();
  }

  const lead = project.lead ?? project.summary ?? "";
  const challenge =
    project.challenge ||
    "This concept explores how a clearer hierarchy, a calmer visual language, and a more considered flow can make a complex experience feel easier to understand.";
  const approach =
    project.approach ||
    "We organized the experience around the questions a user arrives with: Where do I stand? What changed? What should I look at next?";
  const solution =
    project.solution ||
    "A considered type scale, restrained palette, modular cards, and simple chart language create a more coherent product experience. Responsive layouts keep the hierarchy intact as the available space changes.";
  const outcome =
    project.outcome ||
    "This is a design concept, so there are no verified client performance results or before-and-after metrics to report. In a live engagement, the next step would be to validate the experience with usability testing and measure task completion, comprehension, and confidence.";

  return (
    <main id="main">
      <section className="page-hero section-wrap detail-hero">
        <p className="eyebrow">
          <span className="status-dot"></span>
          {project.category ?? "Case study"}
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
            <span className="mono">DISCIPLINE</span>
            <strong id="case-discipline">{project.discipline ?? "—"}</strong>
          </div>
          <div>
            <span className="mono">INDUSTRY</span>
            <strong id="case-industry">{project.industry ?? "—"}</strong>
          </div>
          <div>
            <span className="mono">SCOPE</span>
            <strong id="case-scope">{project.scope ?? "—"}</strong>
          </div>
          <div>
            <span className="mono">PROJECT TYPE</span>
            <strong>Illustrative concept</strong>
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <CaseStudyVisual project={project} />
      </section>

      <section className="section-wrap">
        <div className="case-story">
          <div>
            <p className="eyebrow">01 / The challenge</p>
            <h2 id="case-problem-title" data-reveal data-reveal-delay="0.2">
              Find the signal in the noise.
            </h2>
            <p id="case-challenge" data-reveal data-reveal-delay="0.25">
              {challenge}
            </p>
          </div>
          <div>
            <p>
              The experience needed to help people make sense of dense information without making the product feel
              simplistic. The challenge was to establish a clear hierarchy while keeping meaningful depth close at
              hand.
            </p>
          </div>
        </div>
        <div className="case-story">
          <div>
            <p className="eyebrow">02 / The approach</p>
            <h2 id="case-approach" data-reveal data-reveal-delay="0.3">
              Start with the human question.
            </h2>
            <p id="case-approach">{approach}</p>
            {!project.approach && (
              <ul>
                <li>Give the most important information a clear visual priority.</li>
                <li>Use consistent patterns for summaries, trends, and supporting details.</li>
                <li>Make key actions easy to scan and understand.</li>
                <li>Use color as a functional cue, not decoration.</li>
              </ul>
            )}
          </div>
        </div>
        <div className="case-story">
          <div>
            <p className="eyebrow">03 / The solution</p>
            <h2 id="case-solution" data-reveal data-reveal-delay="0.35">
              Clarity built into the system.
            </h2>
            <p>{solution}</p>
            <div className="case-stats">
              <div className="case-stat">
                <strong>01</strong>
                <span>Clear primary summary</span>
              </div>
              <div className="case-stat">
                <strong>02</strong>
                <span>Consistent data patterns</span>
              </div>
              <div className="case-stat">
                <strong>03</strong>
                <span>Focused next steps</span>
              </div>
            </div>
          </div>
        </div>
        <div className="case-story">
          <div>
            <p className="eyebrow">04 / The outcome</p>
            <h2 id="case-outcome" data-reveal data-reveal-delay="0.4">
              Designed for better decisions.
            </h2>
            <p>{outcome}</p>
            <p className="team-note">
              All names, screens, and results on this page are illustrative concept material—not commissioned client
              work or measured outcomes.
            </p>
          </div>
        </div>
      </section>

      <div className="page-cta">
        <div>
          <h2 data-reveal data-reveal-delay="0.45">Have a similar challenge?</h2>
          <p>Let&apos;s shape a thoughtful solution around your users and goals.</p>
        </div>
        <Link href="/contact" className="button button-dark">
          Start a project <span>↗</span>
        </Link>
      </div>
      <p style={{ padding: "40px 0" }}>
        <Link href="/work" className="text-link" data-reveal data-reveal-delay="0.5">
          ← Back to all work <span>↗</span>
        </Link>
      </p>
    </main>
  );
}
