import Link from "next/link";
import type { PublicProject } from "@/lib/content/types";
import {
  projectEyebrow,
  projectFilterCategory,
  projectListLabel,
  projectVisualKind,
  splitHeadline,
} from "@/lib/content/presentation";

export function PortfolioCard({
  project,
  labels,
}: {
  project: PublicProject;
  labels?: { noteForm?: string; noteDefault?: string; growth?: string };
}) {
  const kind = projectVisualKind(project);
  const brand =
    project.visual?.brand ??
    project.title.trim().split(/\s+/)[0]?.toLowerCase() ??
    "project";
  const listNumber = project.visual?.listNumber ?? project.visual?.number ?? "—";
  const subtitle = project.subtitle ?? project.summary ?? "";
  const headline = splitHeadline(subtitle);
  const note =
    project.visual?.note ??
    (kind === "form"
      ? labels?.noteForm ?? "Everyday objects, considered."
      : labels?.noteDefault ?? "Notes on better work.");

  return (
    <Link
      className={`project ${project.featured ? "project-large" : "project-small"} reveal`}
      data-category={projectFilterCategory(project)}
      href={`/case-study/${project.slug}`}
    >
      {kind === "fintech" && (
        <div className="project-visual visual-fintech">
          <div className="mock-window">
            <div className="mock-top">
              <b>{brand}</b>
              <span>•••</span>
            </div>
            <div className="mock-balance">
              <small>Total balance</small>
              <strong>{listNumber}</strong>
              <span className="growth">
                {project.visual?.growth ?? labels?.growth ?? "↗ 12.8% this month"}
              </span>
            </div>
            <svg viewBox="0 0 500 140" preserveAspectRatio="none">
              <path
                d="M0 110 C40 96 45 112 80 76 S130 88 165 53 S230 76 270 38 S330 63 370 24 S435 36 500 8"
                fill="none"
                stroke="#c8ff43"
                strokeWidth="3"
              />
            </svg>
            <div className="mock-bottom">
              <span>Cash flow</span>
              <span>Activity</span>
              <span>Insights</span>
            </div>
          </div>
          <div className="fintech-orb"></div>
          <span className="visual-label mono">{projectListLabel(project)}</span>
        </div>
      )}

      {(kind === "bloom" || kind === "goodkind") && (
        <div
          className="project-visual visual-bloom"
          style={kind === "goodkind" ? { background: "#e8d7c6" } : undefined}
        >
          <div
            className="bloom-card"
            style={kind === "goodkind" ? { background: "#f9eee2" } : undefined}
          >
            <span
              className="bloom-symbol"
              style={kind === "goodkind" ? { color: "#b2674b" } : undefined}
            >
              {project.visual?.number ?? (kind === "goodkind" ? "g." : "b.")}
            </span>
            <span className="bloom-name">{brand}</span>
            <span className="bloom-sub">{subtitle}</span>
            {kind === "bloom" && (
              <>
                <div className="bloom-petal petal-a"></div>
                <div className="bloom-petal petal-b"></div>
              </>
            )}
          </div>
          <span className="visual-label mono">{projectListLabel(project)}</span>
        </div>
      )}

      {kind === "form" && (
        <div
          className="project-visual visual-form"
          style={project.visualKey.toLowerCase().includes("field") ? { background: "#d6dfd2" } : undefined}
        >
          <div
            className="form-package"
            style={
              project.visualKey.toLowerCase().includes("field")
                ? { background: "#f5f3ed" }
                : undefined
            }
          >
            <span>{project.visual?.brand ?? project.title.toUpperCase()}</span>
            <strong>
              {headline.lead}
              <strong>{headline.accent}</strong>
            </strong>
            <div className="form-circle"></div>
            <small>{note}</small>
          </div>
          <span className="visual-label mono">{projectListLabel(project)}</span>
        </div>
      )}

      {kind === "orbit" && (
        <div className="project-visual visual-orbit">
          <div className="orbit-panel">
            <div className="orbit-sidebar">
              <b>{brand}</b>
              <span>Overview</span>
              <span>Projects</span>
              <span>Reports</span>
              <span>Settings</span>
            </div>
            <div className="orbit-main">
              <small>MONDAY, OCTOBER 12</small>
              <h4>Your team, in sync.</h4>
              <div className="orbit-stats">
                <div>
                  <small>Active projects</small>
                  <b>{listNumber}</b>
                </div>
                <div>
                  <small>Team velocity</small>
                  <b>+24%</b>
                </div>
                <div>
                  <small>On track</small>
                  <b>92%</b>
                </div>
              </div>
              <div className="orbit-chart">
                <i style={{ height: "32%" }}></i>
                <i style={{ height: "48%" }}></i>
                <i style={{ height: "39%" }}></i>
                <i style={{ height: "63%" }}></i>
                <i style={{ height: "55%" }}></i>
                <i style={{ height: "78%" }}></i>
                <i style={{ height: "67%" }}></i>
                <i style={{ height: "92%" }}></i>
                <i style={{ height: "72%" }}></i>
                <i style={{ height: "100%" }}></i>
              </div>
            </div>
          </div>
          <div className="orbit-shape"></div>
          <span className="visual-label mono">{projectListLabel(project)}</span>
        </div>
      )}

      <div className="project-meta">
        <div>
          <p className="eyebrow">{projectEyebrow(project)}</p>
          <h3>{project.title}</h3>
          <p>{project.summary ?? project.subtitle ?? ""}</p>
        </div>
        <span className="round-arrow">↗</span>
      </div>
    </Link>
  );
}
