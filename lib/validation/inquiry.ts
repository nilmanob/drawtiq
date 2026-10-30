import { z } from "zod";

export const INQUIRY_SERVICES = [
  "UI/UX & Product Design",
  "Brand Identity",
  "Graphic Design",
  "Motion Design",
  "Video Editing",
  "Website Design",
  "Ongoing design support",
  "A bit of everything",
] as const;

export const INQUIRY_BUDGETS = [
  "Under $1,000",
  "$1,000–$3,000",
  "$3,000–$7,500",
  "$7,500+",
  "Let's discuss",
] as const;


const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeSingleLine(value: string): string {
  return value
    .replace(CONTROL_CHARACTERS, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeMultiline(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_CHARACTERS, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const singleLineField = (max: number, label: string, min = 1) =>
  z
    .string()
    .transform(sanitizeSingleLine)
    .pipe(
      z
        .string()
        .min(min, `${label} is required.`)
        .max(max, `${label} is too long.`)
    );

/**
 * Shared inquiry validation. Client-side HTML hints are convenience only; this
 * schema is the server-side source of truth. Output strings are sanitized to
 * plain, normalized text before they reach the database or email provider.
 */
export const inquirySchema = z.object({
  name: singleLineField(120, "Name"),
  email: z
    .string()
    .transform((value) => sanitizeSingleLine(value).toLowerCase())
    .pipe(
      z
        .string()
        .email("Enter a valid email address.")
        .max(254, "Email is too long.")
    ),
  // Shape only. The allowed values come from the CMS contact form fields (with
  // INQUIRY_SERVICES / INQUIRY_BUDGETS as the fallback) and are checked by the
  // API route with isAllowedOption, so editing options in the admin never
  // breaks the form.
  service: singleLineField(120, "Service"),
  budget: z
    .string()
    .transform(sanitizeSingleLine)
    .pipe(z.string().max(80, "Budget is too long."))
    .optional()
    .default(""),
  message: z
    .string()
    .transform(sanitizeMultiline)
    .pipe(
      z
        .string()
        .min(10, "Tell us a little more about the project.")
        .max(5000, "Message is too long.")
    ),
  // Honeypot. Real visitors leave this empty; bots tend to fill it in. It is
  // never stored, so it is accepted at any length and returns a normal-looking
  // response instead of revealing the trap with a validation error.
  website: z.string().optional().default(""),
  // Time spent on the form before submission, supplied by the client script.
  // Missing values are allowed so plain API clients are not blocked. Do not cap
  // this value: a visitor may legitimately leave the form open for a long time.
  elapsedMs: z.number().int().nonnegative().optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/** Case- and whitespace-insensitive match against the allowed options. */
export function matchOption(value: string, allowed: Set<string> | readonly string[]): string | null {
  const key = sanitizeSingleLine(value).toLowerCase();
  if (!key) {
    return null;
  }
  for (const option of Array.from(allowed)) {
    if (sanitizeSingleLine(option).toLowerCase() === key) {
      return sanitizeSingleLine(option);
    }
  }
  return null;
}
