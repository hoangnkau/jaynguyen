/**
 * Turns a Payload media URL into something `next/image` will accept anywhere.
 *
 * THE PROBLEM THIS EXISTS FOR
 *
 * payload.config sets `serverURL`, so an upload stored on local disk comes
 * back fully qualified — `http://localhost:3000/api/media/file/portrait.jpg`
 * in development, `https://jaynguyen.fyi/api/media/file/portrait.jpg` in a
 * production build that has no blob token. `next/image` refuses any absolute
 * URL whose hostname is not listed in `images.remotePatterns`, so the same
 * component that works in production throws in development:
 *
 *   Invalid src prop … hostname "localhost" is not configured
 *
 * THE FIX THAT WAS NOT TAKEN
 *
 * Adding `localhost` to remotePatterns. It silences the error and it is the
 * wrong shape: remotePatterns is an allowlist of hosts this site is willing to
 * fetch and optimise images from, and putting a development-only host in it
 * widens a production security setting to fix a development problem. It would
 * also still break for anyone running the app on a different port or host.
 *
 * WHAT IT DOES INSTEAD
 *
 * `/api/media/...` is this application's own route. It is served by whatever
 * origin is serving the page, so the origin is not information — it is noise
 * that varies by environment. Stripping it leaves a relative path, which
 * next/image accepts unconditionally and which is correct on every host.
 *
 * Blob URLs are left exactly as they are: a different origin genuinely is
 * information there, and remotePatterns already allows that one host.
 */
export function toImageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return url;

  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/api/media/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
    return url;
  } catch {
    // Not parseable as a URL. Hand it back untouched — next/image will
    // complain in a way that names the actual value, which is more useful
    // than anything invented here.
    return url;
  }
}
