/**
 * Canonical public site URL used in auth email redirects.
 *
 * Set NEXT_PUBLIC_SITE_URL to the live site so a reset requested from a local
 * build still sends the user to the production password screen. When it is
 * absent, the current browser origin is used.
 */
export function getSiteUrl(fallbackOrigin?: string) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  for (const value of [configured, fallbackOrigin]) {
    if (!value) {
      continue;
    }

    try {
      return new URL(value).origin;
    } catch {
      // Ignore an invalid environment value and use the browser origin.
    }
  }

  return "";
}
