"use client";

import type { AdminService } from "@/lib/admin/types";
import type { AdminFormField } from "@/lib/admin/form-types";
import { AdminRecordForm } from "../_components/admin-record-form";
import { deleteService, saveService } from "./actions";

export function ServiceForm({
  initial,
  saved = false,
}: {
  initial?: AdminService;
  saved?: boolean;
}) {
  const fields: AdminFormField[] = [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      defaultValue: initial?.title ?? "",
      placeholder: "UI/UX Design",
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      required: true,
      defaultValue: initial?.slug ?? "",
      placeholder: "ui-ux-design",
      hint: "Lowercase letters, numbers, and hyphens. Use ui-ux-design, digital-product-design, brand-identity, graphic-design, motion-design, or video-editing to link the public service page.",
      mono: true,
    },
    {
      name: "blurb",
      label: "Blurb",
      type: "text",
      defaultValue: initial?.blurb ?? "",
      fullWidth: true,
    },
    {
      name: "intro",
      label: "Intro",
      type: "textarea",
      rows: 6,
      defaultValue: initial?.intro ?? "",
      fullWidth: true,
    },
    {
      name: "icon",
      label: "Icon key",
      type: "text",
      defaultValue: initial?.icon ?? "",
      placeholder: "icon-ux",
      mono: true,
    },
    {
      name: "preview_path",
      label: "Preview image path",
      type: "text",
      defaultValue: initial?.preview_path ?? "",
      placeholder: "/assets/services/preview.jpg",
      mono: true,
    },
    {
      name: "tags",
      label: "Tags",
      type: "text",
      defaultValue: initial?.tags?.join(", ") ?? "",
      hint: "Comma-separated.",
      fullWidth: true,
    },
    {
      name: "deliverables",
      label: "Deliverables JSON",
      type: "json",
      defaultValue: JSON.stringify(initial?.deliverables ?? [], null, 2),
      hint: "A JSON array of deliverables, for example { \"title\": \"Research\", \"description\": \"...\" }.",
      fullWidth: true,
    },
    {
      name: "faqs",
      label: "FAQs JSON",
      type: "json",
      defaultValue: JSON.stringify(initial?.faqs ?? [], null, 2),
      hint: "A JSON array of FAQ objects, for example { \"question\": \"...\", \"answer\": \"...\" }.",
      fullWidth: true,
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
      action={saveService}
      deleteAction={deleteService}
      fields={fields}
      mode={initial ? "edit" : "create"}
      recordId={initial?.id}
      itemLabel="service"
      listHref="/admin/services"
      editHrefTemplate="/admin/services/[id]"
      saved={saved}
    />
  );
}
