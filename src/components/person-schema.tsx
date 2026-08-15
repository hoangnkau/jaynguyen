import type { SiteSetting } from "@/payload-types";

/**
 * JSON-LD Person schema — this is what gives Google enough structure to show a
 * knowledge panel when someone searches your name. Blueprint §5, SEO.
 *
 * Deliberately omitted: home address, phone number. Blueprint §8.2 — the CMS
 * has no field for either, so neither can leak onto a public page.
 */
export function PersonSchema({ settings }: { settings: SiteSetting }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.legalName,
    alternateName: settings.name,
    url: settings.domain ? `https://${settings.domain}` : undefined,
    email: `mailto:${settings.email}`,
    jobTitle: "Campus Coordinator",
    description: settings.seoDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Darwin",
      addressRegion: "NT",
      addressCountry: "AU",
    },
    worksFor: {
      "@type": "Organization",
      name: "Canterbury Institute of Management",
    },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Charles Darwin University" },
      { "@type": "CollegeOrUniversity", name: "University of York" },
    ],
    knowsLanguage: ["en", "vi"],
    sameAs: (settings.socials ?? [])
      .map((s) => s.href)
      .filter((href) => href?.startsWith("http")),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
