import type { MetadataRoute } from "next";
import { isLiveDomain, resolveServerUrl } from "@/lib/server-url";

export default function robots(): MetadataRoute.Robots {
  // GUARDRAIL: until the real domain is attached, keep the whole preview URL
  // out of the index.
  if (!isLiveDomain()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin and the auth endpoints have no business being indexed.
      disallow: ["/admin", "/api", "/auth"],
    },
    sitemap: `${resolveServerUrl()}/sitemap.xml`,
  };
}
