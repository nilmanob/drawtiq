"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className="theme-toggle"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title="Switch color theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span className="theme-icon" aria-hidden="true">
        {isDark ? "☼" : "◐"}
      </span>
    </button>
  );
}
