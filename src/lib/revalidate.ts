import { revalidatePath } from "next/cache";

/**
 * Blueprint §5, Performance: the public site is static HTML on the CDN and
 * never queries Postgres. Saving in /admin fires these hooks, which rebuild
 * the affected pages in the background — editing feels instant, and a
 * visitor's page load never waits on the database.
 *
 * `revalidatePath("/", "layout")` sweeps every route under the site layout.
 * Narrower invalidation would be tidier, but a piece of content can appear on
 * more pages than the collection knows about — site settings show up in the
 * nav and footer of every page, a project appears on the home page, the index
 * and its own case study. Sweeping is a rebuild of a handful of static pages;
 * missing one is stale content nobody notices.
 *
 * These hooks also run outside Next — the seed script writes through the Local
 * API, where there is no request context and Next throws. Cache invalidation
 * is a side effect of a save, never the point of it, so it is allowed to be
 * unavailable rather than allowed to fail the write.
 */
function outsideNextIsFine(fn: () => void) {
  try {
    fn();
  } catch {
    // No static generation store: running from a script, not a request.
  }
}

export const revalidateSite = () =>
  outsideNextIsFine(() => revalidatePath("/", "layout"));
