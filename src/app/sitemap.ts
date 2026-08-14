import type { MetadataRoute } from "next";
import { blogIsLive, projects, site } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/about", "/projects", "/contact", "/cv"];
  if (blogIsLive) routes.push("/blog");

  return [
    ...routes.map((route) => ({
      url: `${site.url}${route}`,
      lastModified: now,
      priority: route === "" ? 1 : 0.8,
    })),
    ...projects.map((p) => ({
      url: `${site.url}/projects/${p.slug}`,
      lastModified: now,
      priority: 0.6,
    })),
  ];
}
