import type { PublicProject, PublicService } from "./types";

const SERVICE_ICONS: Record<string, { className: string; glyph: string }> = {
  ux: { className: "icon-ux", glyph: "↗" },
  ui: { className: "icon-ux", glyph: "↗" },
  "ui-ux": { className: "icon-ux", glyph: "↗" },
  "ui/ux": { className: "icon-ux", glyph: "↗" },
  product: { className: "icon-product", glyph: "◫" },
  brand: { className: "icon-brand", glyph: "✳" },
  identity: { className: "icon-brand", glyph: "✳" },
  graphic: { className: "icon-graphic", glyph: "Aa" },
  design: { className: "icon-graphic", glyph: "Aa" },
  motion: { className: "icon-motion", glyph: "◉" },
  animation: { className: "icon-motion", glyph: "◉" },
  video: { className: "icon-video", glyph: "✂" },
  editing: { className: "icon-video", glyph: "✂" },
};

export function getServiceIcon(icon: string | null): {
  className: string;
  glyph: string;
} {
  const key = (icon ?? "").trim().toLowerCase().replace(/^icon-/, "");
  return SERVICE_ICONS[key] ?? SERVICE_ICONS.ux;
}

export type ProjectVisualKind =
  | "fintech"
  | "bloom"
  | "goodkind"
  | "form"
  | "orbit";

export function projectVisualKind(project: PublicProject): ProjectVisualKind {
  const key = project.visualKey.toLowerCase();

  if (key.includes("fintech") || key.includes("northstar")) {
    return "fintech";
  }

  if (key.includes("goodkind")) {
    return "goodkind";
  }

  if (key.includes("bloom")) {
    return "bloom";
  }

  if (key.includes("orbit")) {
    return "orbit";
  }

  if (
    key.includes("field") ||
    key.includes("form") ||
    key.includes("editorial")
  ) {
    return "form";
  }

  return "form";
}

export function projectCategoryLabel(project: PublicProject): string {
  const category = project.category?.trim();

  if (category) {
    const parts = category.split(/\s+\/\s+/);
    return parts[parts.length - 1].trim();
  }

  const discipline = project.discipline?.split("·")[0]?.trim();
  return discipline || "Project";
}

export function projectEyebrow(project: PublicProject): string {
  return (
    project.visual?.listEyebrow ??
    [project.industry, projectCategoryLabel(project)]
      .filter(Boolean)
      .join(" · ")
  );
}

export function projectFilterCategory(project: PublicProject): string {
  const haystack = `${project.category ?? ""} ${project.discipline ?? ""}`.toLowerCase();

  if (haystack.includes("brand")) {
    return "branding";
  }

  if (
    haystack.includes("graphic") ||
    haystack.includes("editorial") ||
    haystack.includes("art direction")
  ) {
    return "graphic";
  }

  return "uiux";
}

export function projectListLabel(project: PublicProject): string {
  return (
    project.visual?.listLabel ??
    `${projectCategoryLabel(project).toUpperCase()} / CONCEPT`
  );
}

export function projectDetailLabel(project: PublicProject): string {
  return (
    project.visual?.detailLabel ??
    `${(project.industry ?? projectCategoryLabel(project)).toUpperCase()} / DRAWTIQ`
  );
}

export function projectVisualBrand(project: PublicProject): string {
  return (
    project.visual?.brand ??
    project.title.trim().split(/\s+/)[0]?.toLowerCase() ??
    "project"
  );
}

export function projectVisualNumber(project: PublicProject): string {
  return project.visual?.number ?? "—";
}

export function splitHeadline(subtitle: string | null): {
  lead: string;
  accent: string;
} {
  const text = subtitle?.trim() ?? "";

  if (!text) {
    return { lead: "", accent: "" };
  }

  const lastSpace = text.lastIndexOf(" ");
  if (lastSpace === -1) {
    return { lead: "", accent: text };
  }

  return {
    lead: text.slice(0, lastSpace),
    accent: text.slice(lastSpace + 1),
  };
}

export function formatPostDate(iso: string): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function serviceHref(service: PublicService): string {
  return service.detailPath || "/services";
}
