/**
 * One place decides what the canonical origin is.
 *
 * An unset variable falls back; so does an empty or malformed one. Reading
 * process.env directly and trusting it is how a stray character in .env.local
 * takes down every route with "Invalid URL" at module load.
 */
export const FALLBACK_URL = "https://jaynguyen.fyi";
export const LIVE_DOMAIN = "jaynguyen.fyi";

export function resolveServerUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL?.trim();
  if (!raw) return FALLBACK_URL;
  try {
    const u = new URL(raw);
    if (u.protocol === "http:" || u.protocol === "https:") return u.origin;
  } catch {
    // falls through
  }
  console.warn(
    `[config] NEXT_PUBLIC_SERVER_URL is not a valid URL (${JSON.stringify(raw)}). Falling back to ${FALLBACK_URL}.`,
  );
  return FALLBACK_URL;
}

/**
 * True only when the site is being served from the real domain.
 *
 * Drives robots.txt and the sitemap: while the site lives on a *.vercel.app
 * preview URL it stays out of Google entirely, so the temporary URL can never
 * rank against jaynguyen.fyi and split the domain authority the site exists
 * to build.
 */
export function isLiveDomain(): boolean {
  try {
    return new URL(resolveServerUrl()).hostname === LIVE_DOMAIN;
  } catch {
    return false;
  }
}
