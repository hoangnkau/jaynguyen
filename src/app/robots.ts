import type { MetadataRoute } from "next";
import { isLiveDomain, site } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  // GUARDRAIL: until the real domain is attached, keep the whole preview URL
  // out of the index. A *.vercel.app copy competing with jaynguyen.fyi would
  // split the domain authority the site is trying to build for Jay's name.
  if (!isLiveDomain) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin has no business being indexed.
      disallow: ["/admin", "/api"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
