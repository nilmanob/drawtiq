/**
 * Shared cache settings for public Supabase reads.
 *
 * Public pages use a 60-second revalidation window, and admin mutations also
 * invalidate this tag so published changes appear immediately.
 */
export const PUBLIC_CONTENT_TAG = "public-content";
export const PUBLIC_CONTENT_REVALIDATE = 60;
