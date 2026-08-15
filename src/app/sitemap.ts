import type { MetadataRoute } from "next";
import { blogIsLive, getProjects } from "@/lib/queries";
import { isLiveDomain, resolveServerUrl } from "@/lib/server-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Nothing to advertise while the site is on a preview URL — robots.ts
  // disallows everything until the real domain is attached.
  if (!isLiveDomain()) return [];

  const [projects, showBlog] = await Promise.all([getProjects(), blogIsLive()]);
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
  ];
}
