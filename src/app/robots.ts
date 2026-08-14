import type { MetadataRoute } from "next";
import { site } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // GUARDRAIL (blueprint §8.2): the admin has no business being indexed.
      disallow: ["/admin", "/api"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
