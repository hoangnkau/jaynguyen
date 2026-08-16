import { toImageSrc } from "@/lib/media-url";
import type { SiteSetting } from "@/payload-types";

/**
 * Resolves the headshot from Site Settings into something safe to render.
 *
 * Two things have to be true before an <Image> can go on the page, and both
 * of them fail silently if you assume instead of check:
 *
 *   - the relationship is populated. Public reads run with
 *     overrideAccess: false, so an upload the visitor cannot see comes back
 *     as a bare ID, not an object.
 *   - the record has a url AND alt text. Media requires alt at upload, but
 *     a record created before that rule, or through the API, may not have
 *     it — and a portrait with an empty alt is worse than no portrait,
 *     because a screen reader announces nothing where a person should be.
 *
 * Returning null when either is missing is what lets the pages fall back to
 * a labelled placeholder rather than rendering a broken image.
 *
 * The url goes through toImageSrc for the reason set out in media-url.ts: a
 * locally-stored upload comes back fully qualified against serverURL, and
 * next/image rejects any absolute URL whose host is not in remotePatterns.
 */
export function resolveHeadshot(
  settings: SiteSetting,
): { url: string; alt: string } | null {
  const h = settings.headshot;
  if (typeof h !== "object" || h === null) return null;
  const url = toImageSrc(h.url);
  if (!url || !h.alt?.trim()) return null;
  return { url, alt: h.alt };
}
