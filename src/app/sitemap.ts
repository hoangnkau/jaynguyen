import type { MetadataRoute } from "next";
import { blogIsLive, getPosts, getProjects } from "@/lib/queries";
import { isLiveDomain, resolveServerUrl } from "@/lib/server-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Nothing to advertise while the site is on a preview URL — robots.ts
  // disallows everything until the real domain is attached.
  if (!isLiveDomain()) return [];

  const [projects, posts, showBlog] = await Promise.all([
    getProjects(),
    getPosts(),
    blogIsLive(),
  ]);
  const url = resolveServerUrl();
  const now = new Date();

  const routes = ["", "/about", "/projects", "/contact", "/cv"];
  if (showBlog) routes.push("/blog");

  return [
    ...routes.map((route) => ({
      url: `${url}${route}`,
      lastModified: now,
      priority: route === "" ? 1 : 0.8,
    })),
    // Only published projects are returned, so drafts never reach the sitemap.
    ...projects.map((p) => ({
      url: `${url}/projects/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      priority: 0.6,
    })),
    /**
     * Posts follow the same rule as the index that lists them. A published
     * post before the blog opens is reachable by link — see blog/[slug] — but
     * advertising it to a crawler would put a URL in Google's index with no
     * navigable path to it from the site, which is the definition of an
     * orphan page and reads to a crawler exactly as badly as it sounds.
     */
    ...(showBlog
      ? posts.map((p) => ({
          url: `${url}/blog/${p.slug}`,
          lastModified: new Date(p.updatedAt),
          priority: 0.5,
        }))
      : []),
  ];
}
