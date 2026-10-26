import { z } from "zod";

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);
export const inquiryStatusSchema = z.enum([
  "new",
  "read",
  "replied",
  "archived",
]);

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(140, "Slug is too long.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and single hyphens."
  );

export const uuidSchema = z.string().uuid("Invalid record id.");

const nullableText = (max: number, label: string) =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return null;
      }

      const text = String(value).trim();
      return text.length ? text : null;
    },
    z.string().max(max, `${label} is too long.`).nullable()
  );

const requiredText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} is too long.`);

const sortOrderSchema = z.coerce
  .number()
  .int("Sort order must be a whole number.")
  .min(0, "Sort order cannot be negative.")
  .max(9999, "Sort order is too large.");

const featuredSchema = z.preprocess(
  (value) => value === true || value === "true" || value === "on" || value === "1",
  z.boolean()
);

const jsonArraySchema = z.array(z.unknown()).max(100, "Too many items.");
const jsonObjectSchema = z.record(z.unknown());

export const projectInputSchema = z.object({
  slug: slugSchema,
  title: requiredText(180, "Title"),
  subtitle: nullableText(240, "Subtitle"),
  category: nullableText(120, "Category"),
  discipline: nullableText(160, "Discipline"),
  industry: nullableText(120, "Industry"),
  scope: nullableText(240, "Scope"),
  summary: nullableText(4000, "Summary"),
  challenge: nullableText(8000, "Challenge"),
  approach: nullableText(8000, "Approach"),
  solution: nullableText(8000, "Solution"),
  outcome: nullableText(8000, "Outcome"),
  visual_key: requiredText(80, "Visual key"),
  cover_image_path: nullableText(500, "Cover image path"),
  gallery: jsonArraySchema,
  featured: featuredSchema,
  status: contentStatusSchema,
  sort_order: sortOrderSchema,
  seo_title: nullableText(160, "SEO title"),
  seo_description: nullableText(320, "SEO description"),
});

export const serviceInputSchema = z.object({
  slug: slugSchema,
  title: requiredText(180, "Title"),
  blurb: nullableText(240, "Blurb"),
  intro: nullableText(8000, "Intro"),
  icon: nullableText(80, "Icon"),
  preview_path: nullableText(500, "Preview path"),
  tags: z
    .array(z.string().trim().min(1).max(80, "Tag is too long."))
    .max(30, "Too many tags."),
  deliverables: jsonArraySchema,
  faqs: jsonArraySchema,
  status: contentStatusSchema,
  sort_order: sortOrderSchema,
  seo_title: nullableText(160, "SEO title"),
  seo_description: nullableText(320, "SEO description"),
});

export const postInputSchema = z.object({
  slug: slugSchema,
  title: requiredText(180, "Title"),
  excerpt: nullableText(600, "Excerpt"),
  category: nullableText(120, "Category"),
  read_time: nullableText(80, "Read time"),
  visual: nullableText(40, "Visual"),
  label: nullableText(120, "Label"),
  display: jsonObjectSchema,
  body: jsonArraySchema,
  status: contentStatusSchema,
  sort_order: sortOrderSchema,
  seo_title: nullableText(160, "SEO title"),
  seo_description: nullableText(320, "SEO description"),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ServiceInput = z.infer<typeof serviceInputSchema>;
export type PostInput = z.infer<typeof postInputSchema>;
