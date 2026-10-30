"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { checkPermission } from "@/lib/auth";
import { describeDbError } from "@/lib/admin/errors";
import { formString } from "@/lib/admin/form-data";
import { PUBLIC_CONTENT_TAG } from "@/lib/content/cache";
import {
  contrastChecks,
  DEFAULT_THEME,
  normalizeHex,
  THEME_COLOR_KEYS,
  THEME_COLOR_LABELS,
  THEME_COLUMNS,
  type ThemeColors,
} from "@/lib/theme/colors";
import { GLOBAL_SETTINGS_ID } from "@/lib/theme/server";

export type ThemeActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function isMissingColumn(code: string | undefined) {
  return code === "42703" || code === "PGRST204";
}

const MIGRATION_MESSAGE =
  "The theme columns are missing. Apply supabase/migrations/20261030000100_theme_colors.sql in the Supabase SQL Editor, then save again.";
const BUTTON_MIGRATION_MESSAGE =
  "The button text color needs supabase/migrations/20261030000200_theme_button_text.sql. Apply it in the Supabase SQL Editor, or set Button text color back to Automatic.";

/**
 * Save (or reset) the global theme colors on the canonical global_settings
 * row. Super Admin and Admin only; RLS (can_manage_settings) enforces it too.
 */
export async function saveThemeColors(formData: FormData): Promise<ThemeActionResult> {
  const auth = await checkPermission("settings:write");
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const reset = formString(formData, "intent") === "reset";
  const theme: ThemeColors = { ...DEFAULT_THEME };
  const fieldErrors: Record<string, string[]> = {};

  if (!reset) {
    for (const key of THEME_COLOR_KEYS) {
      const hex = normalizeHex(formString(formData, key));
      if (!hex) {
        fieldErrors[key] = [`${THEME_COLOR_LABELS[key]} must be a HEX color like #c8ff43.`];
      } else {
        theme[key] = hex;
      }
    }

    // Blank means automatic.
    const rawButton = formString(formData, "buttonText").trim();
    if (rawButton) {
      const hex = normalizeHex(rawButton);
      if (!hex) {
        fieldErrors.buttonText = ["Button text color must be a HEX color like #171916, or Automatic."];
      } else {
        theme.buttonText = hex;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, error: "Fix the highlighted colors and save again.", fieldErrors };
    }

    const failing = contrastChecks(theme).filter((check) => !check.ok);
    if (failing.length > 0) {
      return {
        ok: false,
        error: `Not saved: these combinations would be hard to read (need at least 4.5:1): ${failing
          .map((check) => `${check.label} ${check.ratio.toFixed(2)}:1`)
          .join("; ")}.`,
      };
    }
  }

  // Store NULL for default colors, so "default" stays the fallback rather
  // than a copied value.
  const update: Record<string, string | null> = {};
  for (const key of THEME_COLOR_KEYS) {
    update[THEME_COLUMNS[key]] = theme[key] === DEFAULT_THEME[key] ? null : theme[key];
  }
  update[THEME_COLUMNS.buttonText] = theme.buttonText;

  const { supabase } = auth;
  const canonical = await supabase
    .from("global_settings")
    .select("id")
    .eq("id", GLOBAL_SETTINGS_ID)
    .maybeSingle();

  if (canonical.error) {
    return { ok: false, error: describeDbError(canonical.error) };
  }

  let targetId = canonical.data?.id as string | undefined;

  if (!targetId) {
    const lowest = await supabase
      .from("global_settings")
      .select("id")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (lowest.error) {
      return { ok: false, error: describeDbError(lowest.error) };
    }
    targetId = lowest.data?.id as string | undefined;
  }

  const write = (values: Record<string, string | null>) =>
    targetId
      ? supabase.from("global_settings").update(values).eq("id", targetId).select("id").maybeSingle()
      : supabase
          .from("global_settings")
          .insert({ id: GLOBAL_SETTINGS_ID, ...values })
          .select("id")
          .maybeSingle();

  let { data, error } = await write(update);

  // Only the first theme migration applied: save the five colors if no button
  // text color was requested.
  if (error && isMissingColumn(error.code) && theme.buttonText === null) {
    const withoutButton = { ...update };
    delete withoutButton[THEME_COLUMNS.buttonText];
    ({ data, error } = await write(withoutButton));
  }

  if (error) {
    return {
      ok: false,
      error: isMissingColumn(error.code)
        ? theme.buttonText
          ? BUTTON_MIGRATION_MESSAGE
          : MIGRATION_MESSAGE
        : describeDbError(error),
    };
  }

  if (!data) {
    return {
      ok: false,
      error: "The settings record was not updated. Your role may not allow changing site settings.",
    };
  }

  revalidateTag(PUBLIC_CONTENT_TAG);
  revalidatePath("/", "layout");

  return {
    ok: true,
    message: reset
      ? "Default colors restored. The live site updates within a few seconds."
      : "Theme colors saved. The live site updates within a few seconds.",
  };
}
