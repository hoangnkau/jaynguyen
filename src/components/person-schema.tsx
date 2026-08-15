import type { SiteSetting } from "@/payload-types";
import { resolveServerUrl } from "@/lib/server-url";

/**
 * JSON-LD Person schema — this is what gives Google enough structure to show a
 * knowledge panel when someone searches your name. Blueprint §5, SEO.
 *
 * Deliberately omitted: home address, phone number. Blueprint §8.2 — the CMS
 * has no field for either, so neither can leak onto a public page.
 */
export function PersonSchema({
  settings,
  imageUrl,
}: {
  settings: SiteSetting;
  /**
   * The /about portrait, when there is one.
   *
   * `image` is the single property that most often decides whether a knowledge
   * panel renders with a face or a grey placeholder, and it is the reason to
   * bother wiring the portrait through here rather than leaving it as page
   * decoration. Google requires an absolute URL — a relative one is silently
   * ignored, which is the worst kind of ignored — so it is absolutised below
   * rather than trusted to already be one. In production the Vercel Blob URL
   * already is; in local development it is not, and a schema that only works
   * in production is a schema nobody ever tests.
   */
  imageUrl?: string | null;
}) {
  const absoluteImage = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${resolveServerUrl()}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
    : undefined;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.legalName,
    alternateName: settings.name,
    url: settings.domain ? `https://${settings.domain}` : undefined,
    image: absoluteImage,
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
