import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { About, Cv, Home, Post, Project, SiteSetting } from "@/payload-types";

/**
 * All public reads go through here.
 *
 * Pages are statically prerendered, so the database is read at build time and
 * again when a save triggers regeneration — never on a visitor's request.
 * That is what keeps the CMS free at read time (blueprint §5, Performance).
 *
 * These use React's request-scoped `cache()`, NOT `unstable_cache`.
 *
 * unstable_cache persists in .next/cache, and Vercel reuses that cache between
 * deployments. A build could therefore prerender content that was already
 * edited in the CMS — observed here: a project published in the admin was
 * still missing from a rebuild until .next was deleted. A cache that survives
 * a build is a cache that can serve stale content silently.
 *
 * React's cache() dedupes calls within a single render pass (the layout and
 * the page both ask for site settings; Postgres is asked once) and then goes
 * away. Freshness comes from revalidatePath in the collection hooks.
 */
async function client() {
  return getPayload({ config });
}

/**
 * Every public read passes overrideAccess: false.
 *
 * Payload's Local API bypasses access control by default — convenient for
 * scripts, wrong for the public site. Without this, a draft project is
 * returned to visitors even though the collection says otherwise, and the
 * guardrail becomes decoration. Passing no `user` means these run as an
 * anonymous visitor, so the collection's own rules decide what is visible.
 */
const PUBLIC = { overrideAccess: false } as const;

/**
 * The globals need it too, and for a reason that is easy to miss.
 *
 * Globals are world-readable by design — there is nothing secret in the hero
 * copy. But `home.capabilities[].evidence` and `about.skillGroups[].evidence`
 * are RELATIONSHIPS into `projects`, and a populated relationship is fetched
 * under whatever access the parent read was granted.
 *
 * With overrideAccess left at its default of true, an unpublished project
 * populates as a full object — so the "a claim whose evidence has gone away
 * stops being shown" filter in capabilities.tsx never fired, because the
 * evidence always looked present. The guardrail was there, and it was inert.
 *
 * With this, an inaccessible relationship comes back as a bare ID instead of
 * an object, the filter sees it, and the claim disappears from the page. That
 * is the behaviour the blueprint describes.
 */
export const getSiteSettings = cache(
  async (): Promise<SiteSetting> =>
    (await client()).findGlobal({ slug: "site-settings", depth: 2, ...PUBLIC }),
);

export const getHome = cache(
  async (): Promise<Home> =>
    (await client()).findGlobal({ slug: "home", depth: 2, ...PUBLIC }),
);

export const getAbout = cache(
  async (): Promise<About> =>
    (await client()).findGlobal({ slug: "about", depth: 2, ...PUBLIC }),
);

export const getCV = cache(
  async (): Promise<Cv> =>
    (await client()).findGlobal({ slug: "cv", depth: 2, ...PUBLIC }),
);

export const getProjects = cache(async (): Promise<Project[]> => {
  const res = await (await client()).find({
    collection: "projects",
    depth: 2,
    limit: 100,
    sort: "order",
    ...PUBLIC,
  });
  return res.docs;
});

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  const payload = await client();
  const res = await payload.find({
    collection: "projects",
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
    ...PUBLIC,
  });
  return res.docs[0] ?? null;
});

export const getPosts = cache(async (): Promise<Post[]> => {
  const res = await (await client()).find({
    collection: "posts",
    depth: 2,
    limit: 100,
    sort: "-publishedAt",
    ...PUBLIC,
  });
  return res.docs;
});

/**
 * GUARDRAIL (blueprint §8.2): the blog does not exist publicly until three
 * posts do. Nav and home section both key off this. An empty blog is worse
 * than no blog, so the site refuses to show one.
 */
export const MIN_POSTS_TO_SHOW_BLOG = 3;

export const blogIsLive = cache(async (): Promise<boolean> => {
  const res = await (await client()).count({ collection: "posts", ...PUBLIC });
  return res.totalDocs >= MIN_POSTS_TO_SHOW_BLOG;
});
