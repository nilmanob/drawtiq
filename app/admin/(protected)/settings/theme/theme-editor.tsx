"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  buttonTextColor,
  contrastChecks,
  DEFAULT_THEME,
  isDefaultTheme,
  normalizeHex,
  resolveTheme,
  THEME_COLOR_HINTS,
  THEME_COLOR_KEYS,
  THEME_COLOR_LABELS,
  themeTokens,
  type ThemeColorKey,
  type ThemeColors,
} from "@/lib/theme/colors";
import { saveThemeColors } from "./actions";

type Mode = "light" | "dark";

/** CSS variables for the preview, scoped to the preview element only. */
function previewVars(theme: ThemeColors, mode: Mode): CSSProperties {
  const tokens = themeTokens(theme);
  const shared = {
    ...tokens.base,
    "--accent": theme.primary,
  };
  const vars =
    mode === "light"
      ? {
          ...shared,
          ...tokens.light,
          "--bg": theme.background,
          "--ink": theme.text,
          "--paper": theme.white,
          "--dark": theme.black,
        }
      : {
          ...shared,
          ...tokens.dark,
          "--bg": theme.black,
          "--ink": theme.background,
        };
  return vars as CSSProperties;
}

function ThemePreview({ theme, mode }: { theme: ThemeColors; mode: Mode }) {
  return (
    <div className="admin-theme-preview" style={previewVars(theme, mode)} aria-hidden="true">
      <div className="admin-theme-preview-nav">
        <strong>
          Drawtiq<span>.</span>
        </strong>
        <span>Work</span>
        <span>Services</span>
        <span className="admin-theme-preview-cta">Start a project</span>
      </div>
      <div className="admin-theme-preview-hero">
        <p className="admin-theme-preview-eyebrow">Design studio</p>
        <h3>
          Design that moves <em>brands</em> forward.
        </h3>
        <p className="admin-theme-preview-muted">
          Muted supporting copy, captions, and metadata.
        </p>
        <div className="admin-theme-preview-actions">
          <span className="admin-theme-preview-button">Primary button</span>
          <span className="admin-theme-preview-link">Text link →</span>
        </div>
      </div>
      <div className="admin-theme-preview-card">
        <strong>Card on white</strong>
        <p>Cards, pricing plans, and panels use the white color.</p>
      </div>
      <div className="admin-theme-preview-dark">
        <strong>Dark section</strong>
        <p>Contact and footer sit on the black color.</p>
      </div>
    </div>
  );
}

type EditorValues = Record<ThemeColorKey, string> & { buttonText: string };

function toValues(theme: ThemeColors): EditorValues {
  return { ...theme, buttonText: theme.buttonText ?? "" };
}

export function ThemeEditor({
  initial,
  canSave,
  buttonTextSupported,
}: {
  initial: ThemeColors;
  canSave: boolean;
  buttonTextSupported: boolean;
}) {
  const router = useRouter();
  // Raw text per field so partly typed HEX values are not overwritten.
  // buttonText "" means automatic.
  const [values, setValues] = useState<EditorValues>(toValues(initial));
  const [mode, setMode] = useState<Mode>("light");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const buttonAuto = values.buttonText.trim() === "";
  const invalid = [
    ...THEME_COLOR_KEYS.filter((key) => !normalizeHex(values[key])),
    ...(!buttonAuto && !normalizeHex(values.buttonText) ? ["buttonText"] : []),
  ];
  const theme = useMemo(() => resolveTheme(values), [values]);
  const checks = useMemo(() => contrastChecks(theme), [theme]);
  const failing = checks.filter((check) => !check.ok);
  const savedTheme = resolveTheme(initial);
  const dirty =
    THEME_COLOR_KEYS.some((key) => theme[key] !== savedTheme[key]) ||
    theme.buttonText !== savedTheme.buttonText ||
    invalid.length > 0;

  function setColor(key: ThemeColorKey | "buttonText", value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setMessage(null);
    setFieldErrors((previous) => ({ ...previous, [key]: [] }));
  }

  async function submit(intent: "save" | "reset") {
    setPending(true);
    setMessage(null);
    setError(null);
    setFieldErrors({});

    try {
      const formData = new FormData();
      formData.set("intent", intent);
      THEME_COLOR_KEYS.forEach((key) => formData.set(key, values[key]));
      formData.set("buttonText", buttonAuto ? "" : values.buttonText);
      const result = await saveThemeColors(formData);

      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setValues(toValues(intent === "reset" ? { ...DEFAULT_THEME } : theme));
      setMessage(result.message);
      router.refresh();
    } catch {
      setError("The request failed. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit("save");
  }

  function handleReset() {
    if (
      window.confirm(
        "Restore the original Drawtiq colors on the live site? Your custom colors will be cleared."
      )
    ) {
      void submit("reset");
    }
  }

  return (
    <form className="admin-theme-layout" onSubmit={handleSubmit}>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Theme / Colors</p>
            <h2>Global colors</h2>
          </div>
        </div>

        <div className="admin-theme-fields">
          {THEME_COLOR_KEYS.map((key) => {
            const hex = normalizeHex(values[key]);
            const changed = theme[key] !== DEFAULT_THEME[key];
            const errorText = fieldErrors[key]?.[0] ?? (hex ? null : "Use a HEX color like #c8ff43.");

            return (
              <div className="admin-theme-field" key={key}>
                <label htmlFor={`theme-${key}-hex`}>{THEME_COLOR_LABELS[key]}</label>
                <div className="admin-color-row">
                  <input
                    type="color"
                    className="admin-color-picker"
                    value={hex ?? theme[key]}
                    onChange={(event) => setColor(key, event.target.value)}
                    aria-label={`${THEME_COLOR_LABELS[key]} picker`}
                    disabled={!canSave}
                  />
                  <input
                    id={`theme-${key}-hex`}
                    className="admin-input admin-color-hex"
                    value={values[key]}
                    onChange={(event) => setColor(key, event.target.value)}
                    maxLength={7}
                    spellCheck={false}
                    autoComplete="off"
                    aria-invalid={errorText ? true : undefined}
                    disabled={!canSave}
                  />
                  {changed ? (
                    <button
                      type="button"
                      className="admin-inline-button"
                      onClick={() => setColor(key, DEFAULT_THEME[key])}
                      disabled={!canSave}
                      title={`Default: ${DEFAULT_THEME[key]}`}
                    >
                      Default
                    </button>
                  ) : null}
                </div>
                <p className="admin-field-hint">{THEME_COLOR_HINTS[key]}</p>
                {errorText ? <p className="admin-field-error">{errorText}</p> : null}
              </div>
            );
          })}

          <div className="admin-theme-field">
            <label htmlFor="theme-buttonText-hex">{THEME_COLOR_LABELS.buttonText}</label>
            <div className="admin-color-row">
              <input
                type="color"
                className="admin-color-picker"
                value={normalizeHex(values.buttonText) ?? buttonTextColor(theme)}
                onChange={(event) => setColor("buttonText", event.target.value)}
                aria-label={`${THEME_COLOR_LABELS.buttonText} picker`}
                disabled={!canSave || !buttonTextSupported}
              />
              <input
                id="theme-buttonText-hex"
                className="admin-input admin-color-hex"
                value={buttonAuto ? "" : values.buttonText}
                placeholder={`Auto (${buttonTextColor(theme)})`}
                onChange={(event) => setColor("buttonText", event.target.value)}
                maxLength={7}
                spellCheck={false}
                autoComplete="off"
                aria-invalid={!buttonAuto && !normalizeHex(values.buttonText) ? true : undefined}
                disabled={!canSave || !buttonTextSupported}
              />
              {!buttonAuto ? (
                <button
                  type="button"
                  className="admin-inline-button"
                  onClick={() => setColor("buttonText", "")}
                  disabled={!canSave}
                >
                  Automatic
                </button>
              ) : null}
            </div>
            <p className="admin-field-hint">
              {buttonTextSupported
                ? THEME_COLOR_HINTS.buttonText
                : "Apply 20261030000200_theme_button_text.sql to enable this field."}
            </p>
            {fieldErrors.buttonText?.[0] || (!buttonAuto && !normalizeHex(values.buttonText)) ? (
              <p className="admin-field-error">
                {fieldErrors.buttonText?.[0] ?? "Use a HEX color like #171916, or Automatic."}
              </p>
            ) : null}
          </div>
        </div>

        <div className="admin-theme-contrast">
          <p className="admin-kicker">Readability (WCAG, minimum 4.5:1)</p>
          <ul>
            {checks.map((check) => (
              <li key={check.id} className={check.ok ? "is-ok" : "is-fail"}>
                <span
                  className="admin-theme-swatch"
                  style={{ background: check.background, color: check.foreground }}
                >
                  Aa
                </span>
                <span>{check.label}</span>
                <strong>
                  {check.ratio.toFixed(2)}:1 {check.ok ? "✓" : "✗"}
                </strong>
              </li>
            ))}
          </ul>
        </div>

        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="admin-inline-success" role="status">
            {message}
          </p>
        ) : null}

        <div className="admin-form-actions">
          <button
            className="admin-button"
            type="submit"
            disabled={!canSave || pending || invalid.length > 0 || failing.length > 0 || !dirty}
          >
            {pending ? "Saving…" : "Save colors"}
          </button>
          <button
            className="admin-button admin-button-secondary"
            type="button"
            onClick={() => setValues(toValues(savedTheme))}
            disabled={pending || !dirty}
          >
            Undo changes
          </button>
          <button
            className="admin-inline-button"
            type="button"
            onClick={handleReset}
            disabled={!canSave || pending || (isDefaultTheme(savedTheme) && isDefaultTheme(theme))}
          >
            Restore defaults
          </button>
        </div>
        {failing.length > 0 ? (
          <p className="admin-field-hint">
            Saving is disabled until every readability check passes.
          </p>
        ) : null}
      </section>

      <section className="admin-panel admin-theme-preview-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Live preview</p>
            <h2>{mode === "light" ? "Light mode" : "Dark mode"}</h2>
          </div>
          <div className="admin-chart-controls" role="group" aria-label="Preview mode">
            {(["light", "dark"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={`admin-chart-toggle${mode === item ? " is-active" : ""}`}
                aria-pressed={mode === item}
                onClick={() => setMode(item)}
              >
                {item === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </div>
        <ThemePreview theme={theme} mode={mode} />
        <p className="admin-field-hint">
          Preview only. Visitors see the new colors after you save. Visitors who
          switch the site to dark mode get the dark version.
        </p>
      </section>
    </form>
  );
}
