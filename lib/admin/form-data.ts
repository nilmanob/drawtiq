import { z } from "zod";

export function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function formJsonArray(formData: FormData, key: string) {
  const raw = formString(formData, key).trim() || "[]";

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { value: [] as unknown[], error: "Must be a JSON array." };
    }

    return { value: parsed, error: null };
  } catch {
    return { value: [] as unknown[], error: "Must be valid JSON." };
  }
}

export function formJsonObject(formData: FormData, key: string) {
  const raw = formString(formData, key).trim() || "{}";

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {
        value: {} as Record<string, unknown>,
        error: "Must be a JSON object.",
      };
    }

    return { value: parsed as Record<string, unknown>, error: null };
  } catch {
    return {
      value: {} as Record<string, unknown>,
      error: "Must be valid JSON.",
    };
  }
}

export function commaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function zodFieldErrors(error: z.ZodError) {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

export function mergeFieldErrors(
  first: Record<string, string[]>,
  second: Record<string, string[]>
) {
  const merged: Record<string, string[]> = { ...first };

  for (const [key, messages] of Object.entries(second)) {
    if (messages?.length) {
      merged[key] = [...(merged[key] ?? []), ...messages];
    }
  }

  return merged;
}
