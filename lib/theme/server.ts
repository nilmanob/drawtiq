import "server-only";

import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabasePublicClient } from "@/lib/supabase/public";
import {
  DEFAULT_THEME,
  resolveTheme,
  THEME_COLOR_KEYS,
  THEME_COLUMNS,
  type ThemeColorKey,
  type ThemeColors,
} from "./colors";

// Same canonical row the public site reads for every other global setting
// (lib/content/cms.ts). Legacy duplicate rows are ignored.
export const GLOBAL_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

const BASE_COLUMNS = THEME_COLOR_KEYS.map((key) => THEME_COLUMNS[key]);
// Newer column first; dropped automatically if its migration is not applied.
const SELECTS = [
  [...BASE_COLUMNS, THEME_COLUMNS.buttonText].join(", "),
  BASE_COLUMNS.join(", "),
];

export function themeFromRow(row: Record<string, unknown> | null | undefined): ThemeColors {
  if (!row) {
    return { ...DEFAULT_THEME };
  }

  const partial: Partial<Record<ThemeColorKey | "buttonText", unknown>> = {};
  for (const key of [...THEME_COLOR_KEYS, "buttonText" as const]) {
    partial[key] = row[THEME_COLUMNS[key]];
  }
  return resolveTheme(partial);
}

export type ThemeRowResult =
  | { ok: true; theme: ThemeColors; buttonTextSupported: boolean }
  | { ok: false; missingColumns: boolean; error: { code?: string; message?: string } };

function isMissingColumn(code: string | undefined) {
  return code === "42703" || code === "PGRST204";
}

/**
 * Read the theme from the canonical settings row (or the lowest id when that
 * row does not exist), tolerating a database where only the first theme
 * migration has been applied.
 */
export async function readThemeRow(client: SupabaseClient): Promise<ThemeRowResult> {
  let lastError: { code?: string; message?: string } | null = null;

  for (let index = 0; index < SELECTS.length; index++) {
    const select = SELECTS[index];
    const canonical = await client
      .from("global_settings")
      .select(select)
      .eq("id", GLOBAL_SETTINGS_ID)
      .maybeSingle();

    if (canonical.error) {
      lastError = canonical.error;
      if (isMissingColumn(canonical.error.code)) {
        continue;
      }
      return { ok: false, missingColumns: false, error: canonical.error };
    }

    let row = canonical.data as unknown as Record<string, unknown> | null;

    if (!row) {
      const lowest = await client
        .from("global_settings")
        .select(select)
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (lowest.error) {
        return { ok: false, missingColumns: false, error: lowest.error };
      }
      row = lowest.data as unknown as Record<string, unknown> | null;
    }

    return { ok: true, theme: themeFromRow(row), buttonTextSupported: index === 0 };
  }

  return { ok: false, missingColumns: true, error: lastError ?? {} };
}

/**
 * Saved theme colors for the public site. Never throws: any failure (no
 * Supabase, migration not applied, network) returns the default palette, so
 * the site always renders with the approved design.
 *
 * Reads go through the public client, which caches with the public-content
 * tag; saving the theme revalidates that tag.
 */
export const getThemeColors = cache(async (): Promise<ThemeColors> => {
  if (!hasSupabaseEnv()) {
    return { ...DEFAULT_THEME };
  }

  try {
    const result = await readThemeRow(getSupabasePublicClient());
    return result.ok ? result.theme : { ...DEFAULT_THEME };
  } catch {
    return { ...DEFAULT_THEME };
  }
});
