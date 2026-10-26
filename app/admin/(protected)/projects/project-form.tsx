"use client";

import type { AdminProject } from "@/lib/admin/types";
import type { AdminFormField } from "@/lib/admin/form-types";
import { AdminRecordForm } from "../_components/admin-record-form";
import { deleteProject, saveProject } from "./actions";

export function ProjectForm({
  initial,
  saved = false,
}: {
  initial?: AdminProject;
  saved?: boolean;
}) {
  const fields: AdminFormField[] = [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      defaultValue: initial?.title ?? "",
      placeholder: "Northstar Finance",
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      required: true,
      defaultValue: initial?.slug ?? "",
      placeholder: "northstar-finance",
      hint: "Lowercase letters, numbers, and hyphens.",
      mono: true,
    },
    {
      name: "subtitle",
      label: "Subtitle",
      type: "text",
      defaultValue: initial?.subtitle ?? "",
      fullWidth: true,
    },
    {
      name: "category",
      label: "Category",
      type: "text",
      defaultValue: initial?.category ?? "",
      placeholder: "Case study / UI/UX",
      hint: "Include UI/UX, Branding, or Graphic so the public filters group the project correctly.",
    },
    {
      name: "discipline",
      label: "Discipline",
      type: "text",
      defaultValue: initial?.discipline ?? "",
      placeholder: "UI/UX · Product design",
    },
    {
      name: "industry",
      label: "Industry",
      type: "text",
      defaultValue: initial?.industry ?? "",
      placeholder: "Fintech",
    },
    {
      name: "scope",
      label: "Scope",
      type: "text",
      defaultValue: initial?.scope ?? "",
      placeholder: "Product strategy, UX, UI",
    },
    {
      name: "summary",
      label: "Summary",
      type: "textarea",
      rows: 4,
      defaultValue: initial?.summary ?? "",
      hint: "Used as the work card description and the case study lead.",
      fullWidth: true,
    },
    {
      name: "challenge",
      label: "Challenge",
      type: "textarea",
      rows: 6,
      defaultValue: initial?.challenge ?? "",
      fullWidth: true,
    },
    {
      name: "approach",
      label: "Approach",
      type: "textarea",
      rows: 6,
      defaultValue: initial?.approach ?? "",
      fullWidth: true,
    },
    {
      name: "solution",
      label: "Solution",
      type: "textarea",
      rows: 6,
      defaultValue: initial?.solution ?? "",
      fullWidth: true,
    },
    {
      name: "outcome",
      label: "Outcome",
      type: "textarea",
      rows: 6,
      defaultValue: initial?.outcome ?? "",
      fullWidth: true,
    },
    {
      name: "visual_key",
      label: "Visual key",
      type: "text",
      required: true,
      defaultValue: initial?.visual_key ?? "custom",
      hint: "Visual treatment: fintech, bloom, form, orbit, goodkind, field-notes, or custom.",
      mono: true,
    },
    {
      name: "cover_image_path",
      label: "Cover image path",
      type: "text",
      defaultValue: initial?.cover_image_path ?? "",
      placeholder: "/assets/projects/project.jpg",
      mono: true,
    },
    {
      name: "gallery",
      label: "Gallery JSON",
      type: "json",
      defaultValue: JSON.stringify(initial?.gallery ?? [], null, 2),
      hint: "A JSON array of image paths or objects.",
      fullWidth: true,
    },
    {
      name: "featured",
      label: "Featured project",
      type: "checkbox",
      defaultValue: initial?.featured ?? false,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      defaultValue: initial?.status ?? "draft",
      options: [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      name: "sort_order",
      label: "Sort order",
      type: "number",
      required: true,
      defaultValue: initial?.sort_order ?? 0,
      hint: "Lower numbers appear first.",
    },
    {
      name: "seo_title",
      label: "SEO title",
      type: "text",
      defaultValue: initial?.seo_title ?? "",
      fullWidth: true,
    },
    {
      name: "seo_description",
      label: "SEO description",
      type: "textarea",
      rows: 3,
      defaultValue: initial?.seo_description ?? "",
      fullWidth: true,
    },
  ];

  return (
    <AdminRecordForm
      action={saveProject}
      deleteAction={deleteProject}
      fields={fields}
      mode={initial ? "edit" : "create"}
      recordId={initial?.id}
      itemLabel="project"
      listHref="/admin/projects"
      editHrefTemplate="/admin/projects/[id]"
      saved={saved}
    />
  );
}
