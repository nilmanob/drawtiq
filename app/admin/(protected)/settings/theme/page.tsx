import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError } from "@/lib/admin/errors";
import { DEFAULT_THEME } from "@/lib/theme/colors";
import { readThemeRow } from "@/lib/theme/server";
import { AdminErrorState, AdminPageHeader } from "../../_components/admin-ui";
import { ThemeEditor } from "./theme-editor";

export const metadata: Metadata = {
  title: "Theme & colors",
};

// The settings layout already limits this route to Super Admin and Admin.
export default async function ThemeSettingsPage() {
  const result = await readThemeRow(createSupabaseServerClient());
  const missingAll = !result.ok && result.missingColumns;
  const buttonTextSupported = result.ok && result.buttonTextSupported;

  return (
    <>
      <AdminPageHeader
        kicker="Site settings / Theme & colors"
        title="Theme & colors"
        description="Set the global colors used across every public page. Shades for muted text, lines, and surfaces are derived automatically, and saves are blocked if text would become hard to read."
      />

      {!result.ok && !result.missingColumns ? (
        <AdminErrorState
          title="Theme colors could not load"
          message={describeDbError(result.error)}
        />
      ) : null}

      {missingAll || (result.ok && !buttonTextSupported) ? (
        <div className="admin-alert admin-alert-error" role="status">
          <strong>Database update needed</strong>
          <p>
            {missingAll ? (
              <>
                Apply <code>20261030000100_theme_colors.sql</code> and{" "}
                <code>20261030000200_theme_button_text.sql</code> in the
                Supabase SQL Editor to enable saving. Until then the site uses
                the default colors.
              </>
            ) : (
              <>
                Apply <code>20261030000200_theme_button_text.sql</code> in the
                Supabase SQL Editor to enable the button text color. The other
                colors can be saved now.
              </>
            )}
          </p>
        </div>
      ) : null}

      {result.ok || missingAll ? (
        <ThemeEditor
          initial={result.ok ? result.theme : { ...DEFAULT_THEME }}
          canSave={result.ok}
          buttonTextSupported={buttonTextSupported}
        />
      ) : null}
    </>
  );
}
