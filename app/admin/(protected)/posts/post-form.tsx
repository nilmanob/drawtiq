"use client";

import type { AdminPost } from "@/lib/admin/types";
import type { AdminFormField } from "@/lib/admin/form-types";
import { AdminRecordForm } from "../_components/admin-record-form";
import { deletePost, savePost } from "./actions";

export function PostForm({
  initial,
  saved = false,
}: {
  initial?: AdminPost;
  saved?: boolean;
}) {
  const fields: AdminFormField[] = [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      defaultValue: initial?.title ?? "",
      placeholder: "Clarity is a feature, not a finishing touch.",
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      required: true,
      defaultValue: initial?.slug ?? "",
      placeholder: "clarity-is-a-feature",
      hint: "Lowercase letters, numbers, and hyphens.",
      mono: true,
    },
    {
      name: "excerpt",
      label: "Excerpt",
      type: "textarea",
      rows: 4,
      defaultValue: initial?.excerpt ?? "",
      fullWidth: true,
    },
    {
      name: "category",
      label: "Category",
      type: "text",
      defaultValue: initial?.category ?? "",
      placeholder: "Design principles",
    },
    {
      name: "read_time",
      label: "Read time",
      type: "text",
      defaultValue: initial?.read_time ?? "",
      placeholder: "5 min read",
    },
    {
      name: "visual",
      label: "Visual treatment",
      type: "select",
      defaultValue: initial?.visual ?? "one",
      options: [
        { value: "one", label: "One" },
        { value: "two", label: "Two" },
        { value: "three", label: "Three" },
        { value: "four", label: "Four" },
        { value: "five", label: "Five" },
      ],
    },
    {
      name: "label",
      label: "Label",
      type: "text",
      defaultValue: initial?.label ?? "",
      placeholder: "FIELD NOTES / 001",
    },
    {
      name: "display",
      label: "Display JSON",
      type: "json",
      defaultValue: JSON.stringify(initial?.display ?? {}, null, 2),
      hint: "A JSON object with an html string for the listing card, for example { \"html\": \"Less,<br /><em>but better.</em>\" }.",
      fullWidth: true,
    },
    {
      name: "body",
      label: "Body JSON",
      type: "json",
      defaultValue: JSON.stringify(initial?.body ?? [], null, 2),
      hint: "A JSON array of blocks: { \"type\": \"p\", \"text\": \"...\" }, h2, quote, or list with an items array.",
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
      action={savePost}
      deleteAction={deletePost}
      fields={fields}
      mode={initial ? "edit" : "create"}
      recordId={initial?.id}
      itemLabel="blog post"
      listHref="/admin/posts"
      editHrefTemplate="/admin/posts/[id]"
      saved={saved}
    />
  );
}
