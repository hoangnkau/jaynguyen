import { site } from "@/lib/site-config";

/**
 * JSON-LD Person schema — this is what gives Google enough structure to show a
 * knowledge panel when someone searches your name. Blueprint §5, SEO.
 *
 * Deliberately omitted: home address, phone number. Blueprint §8.2 — if there is
 * no field for it, it cannot leak onto a public page.
 */
export function PersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: "Campus Coordinator",
    description: site.description,
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
    knowsAbout: [
      "Network administration",
      "IT infrastructure",
      "Cyber security",
      "Multi-factor authentication",
      "Accounting",
    ],
    knowsLanguage: ["en", "vi"],
    sameAs: site.socials
      .map((s) => s.href)
      .filter((href) => href.startsWith("http")),
  };

  return (
    <script
      type="application/ld+json"
      // Content is a static object we construct, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
