/**
 * Global theme colors. Pure functions shared by the server (CSS injection,
 * validation) and the admin editor (live preview), so both always agree.
 *
 * Guarantee: with the default palette nothing is injected and every CSS
 * variable keeps its original value from styles/global.css. Derived shades are
 * only recalculated when a color they depend on has been changed.
 */

export const THEME_COLOR_KEYS = [
  "primary",
  "background",
  "text",
  "white",
  "black",
] as const;

export type ThemeColorKey = (typeof THEME_COLOR_KEYS)[number];

export type ThemeColors = Record<ThemeColorKey, string> & {
  /** Text on primary-colored buttons. null = automatic (original values). */
  buttonText: string | null;
};

/** The approved Drawtiq palette. Matches the static values in global.css. */
export const DEFAULT_THEME: ThemeColors = {
  primary: "#c8ff43",
  background: "#f5f3ed",
  text: "#171916",
  white: "#fffef9",
  black: "#171916",
  buttonText: null,
};

/** Original button label colors on the primary color, per mode. */
const DEFAULT_BUTTON_TEXT = { light: "#20251a", dark: "#171916" };

export const THEME_COLOR_LABELS: Record<ThemeColorKey | "buttonText", string> = {
  primary: "Primary / theme color",
  background: "Background color",
  text: "Text color",
  white: "White color",
  black: "Black color",
  buttonText: "Button text color",
};

export const THEME_COLOR_HINTS: Record<ThemeColorKey | "buttonText", string> = {
  primary: "Accent: buttons, highlights, active states, link hovers, and decorative marks.",
  background: "Page background in light mode, and text color in dark sections and dark mode.",
  text: "Body text and headings in light mode.",
  white: "Cards, panels, and raised surfaces in light mode.",
  black: "Dark sections (contact, footer) and the dark-mode background.",
  buttonText: "Label color on primary-colored buttons. Automatic keeps the original dark label.",
};

/** Database column for each color on public.global_settings. */
export const THEME_COLUMNS: Record<ThemeColorKey | "buttonText", string> = {
  primary: "theme_primary",
  background: "theme_background",
  text: "theme_text",
  white: "theme_white",
  black: "theme_black",
  buttonText: "theme_button_text",
};

/** Accepts #rgb or #rrggbb (any case). Returns lowercase #rrggbb or null. */
export function normalizeHex(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const raw = value.trim().toLowerCase();
  const short = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(raw);
  if (short) {
    return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
  }

  const long = /^#?([0-9a-f]{6})$/.exec(raw);
  return long ? `#${long[1]}` : null;
}

/** Fill any missing or invalid color with its default. */
export function resolveTheme(
  partial: Partial<Record<ThemeColorKey | "buttonText", unknown>>
): ThemeColors {
  const theme: ThemeColors = { ...DEFAULT_THEME };
  for (const key of THEME_COLOR_KEYS) {
    const hex = normalizeHex(partial[key]);
    if (hex) {
      theme[key] = hex;
    }
  }
  theme.buttonText = normalizeHex(partial.buttonText);
  return theme;
}

export function isDefaultTheme(theme: ThemeColors) {
  return (
    THEME_COLOR_KEYS.every((key) => theme[key] === DEFAULT_THEME[key]) &&
    theme.buttonText === null
  );
}

function toRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b]
    .map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Linear blend: amount 0 returns `from`, 1 returns `to`. */
export function mixHex(from: string, to: string, amount: number) {
  const a = toRgb(from);
  const b = toRgb(to);
  return toHex([
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ]);
}

function luminance(hex: string) {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1 to 21. */
export function contrastRatio(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

function primaryUnchanged(theme: ThemeColors) {
  return theme.primary === DEFAULT_THEME.primary;
}

/**
 * The label color used on primary buttons in light mode: the saved button
 * text color, else the original label for the original primary, else the
 * theme's black or white, whichever reads better on the new primary.
 */
export function buttonTextColor(theme: ThemeColors, mode: "light" | "dark" = "light") {
  if (theme.buttonText) {
    return theme.buttonText;
  }

  if (primaryUnchanged(theme)) {
    return DEFAULT_BUTTON_TEXT[mode];
  }

  return contrastRatio(theme.black, theme.primary) >= contrastRatio(theme.white, theme.primary)
    ? theme.black
    : theme.white;
}

export const MIN_TEXT_CONTRAST = 4.5;

export type ContrastCheck = {
  id: string;
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  ok: boolean;
};

/** Pairs that carry text somewhere on the site. All must reach 4.5:1. */
export function contrastChecks(theme: ThemeColors): ContrastCheck[] {
  const pairs: Array<[string, string, string, string]> = [
    ["text-background", "Text on background", theme.text, theme.background],
    ["text-white", "Text on cards (white)", theme.text, theme.white],
    ["light-on-black", "Light text on dark sections", theme.background, theme.black],
    ["button-primary", "Button text on primary", buttonTextColor(theme), theme.primary],
  ];

  return pairs.map(([id, label, foreground, background]) => {
    const ratio = contrastRatio(foreground, background);
    return { id, label, foreground, background, ratio, ok: ratio >= MIN_TEXT_CONTRAST };
  });
}

type TokenSet = Record<string, string>;

/**
 * Original value of each derived shade, and how far it sits between its two
 * source colors. Used only when one of those colors has been changed.
 */
const ON_DARK_SHADES: Array<[string, string, number]> = [
  ["--on-dark-label", "#e8e8df", 0.94],
  ["--on-dark-soft", "#b9bcb1", 0.73],
  ["--on-dark-muted", "#a5a89e", 0.64],
  ["--on-dark-faint", "#85887d", 0.5],
  ["--on-dark-line-strong", "#55584e", 0.28],
  ["--on-dark-input-line", "#53564b", 0.27],
  ["--on-dark-line", "#41443b", 0.19],
  ["--on-dark-panel", "#22241f", 0.05],
];

/**
 * Every CSS custom property the theme controls, for light and dark mode.
 * Shades keep their exact original values while their source colors are
 * unchanged, and are blended from the new colors otherwise.
 */
export function themeTokens(theme: ThemeColors): { base: TokenSet; light: TokenSet; dark: TokenSet } {
  const d = DEFAULT_THEME;
  const lightPairDefault = theme.text === d.text && theme.background === d.background;
  const darkPairDefault = theme.black === d.black && theme.background === d.background;

  const base: TokenSet = {
    "--color-primary": theme.primary,
    "--color-background": theme.background,
    "--color-text": theme.text,
    "--color-white": theme.white,
    "--color-black": theme.black,
  };
  for (const [name, original, amount] of ON_DARK_SHADES) {
    base[name] = darkPairDefault ? original : mixHex(theme.black, theme.background, amount);
  }

  const lightButton = buttonTextColor(theme, "light");
  const darkButton = buttonTextColor(theme, "dark");

  return {
    base,
    light: {
      "--muted": lightPairDefault ? "#666960" : mixHex(theme.text, theme.background, 0.355),
      "--line": lightPairDefault ? "#d9d8ce" : mixHex(theme.text, theme.background, 0.87),
      "--surface": lightPairDefault ? "#ebe9df" : mixHex(theme.text, theme.background, 0.95),
      "--accent-ink": primaryUnchanged(theme) ? DEFAULT_BUTTON_TEXT.light : lightButton,
      "--button-text": lightButton,
    },
    dark: {
      "--paper": darkPairDefault ? "#20221e" : mixHex(theme.black, theme.background, 0.04),
      "--muted": darkPairDefault ? "#b1b3a9" : mixHex(theme.black, theme.background, 0.69),
      "--line": darkPairDefault ? "#41443b" : mixHex(theme.black, theme.background, 0.19),
      "--surface": darkPairDefault ? "#242720" : mixHex(theme.black, theme.background, 0.06),
      "--dark": theme.black === d.black ? "#0e0f0d" : mixHex(theme.black, "#000000", 0.4),
      "--accent-ink": primaryUnchanged(theme) ? DEFAULT_BUTTON_TEXT.dark : darkButton,
      "--button-text": darkButton,
    },
  };
}

function block(selector: string, tokens: TokenSet) {
  const body = Object.entries(tokens)
    .map(([name, value]) => `${name}:${value}`)
    .join(";");
  return `${selector}{${body}}`;
}

/**
 * Override stylesheet for a saved theme, or "" for the default palette so the
 * site renders exactly as designed. Selectors outrank the ones in global.css
 * regardless of stylesheet order. Values are validated hex, never raw input.
 */
export function themeCss(theme: ThemeColors) {
  if (isDefaultTheme(theme)) {
    return "";
  }

  const tokens = themeTokens(theme);
  return [
    block("html:root", tokens.base),
    block('html:root:not([data-theme="dark"])', tokens.light),
    block('html:root[data-theme="dark"]', tokens.dark),
  ].join("");
}
