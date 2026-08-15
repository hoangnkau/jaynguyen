import type { CollectionConfig } from "payload";

/**
 * Downloadable documents — today that means one CV PDF.
 *
 * WHY NOT JUST ALLOW application/pdf IN Media
 *
 * That was the one-line fix and it is the wrong one, because of what Media's
 * `alt` field is. It is required, and its validator rejects anything under
 * five characters or ending in an image extension, with the message
 * "Describe the image for someone who cannot see it." That guardrail exists
 * so accessibility stops being something you remember and becomes something
 * you cannot skip (blueprint §8.1).
 *
 * A PDF has no alt text. It is not rendered as an <img>; /cv links to it under
 * the words "Download PDF", and a screen reader reads the link, not the file.
 * Letting PDFs into Media would mean either forcing a meaningless description
 * onto every document — which teaches you to type something to get past the
 * form, and that is how a real guardrail becomes a habit of dismissing it — or
 * relaxing `alt` to optional, which would quietly remove the check from every
 * image on the site to accommodate one file that is not an image.
 *
 * Two collections, because the two things genuinely have different rules: one
 * needs a description and three generated sizes, the other needs neither and
 * needs a label instead.
 *
 * NOTE FOR WHOEVER ADDS THE NEXT COLLECTION WITH AN UPLOAD
 *
 * It must also be listed in the vercelBlobStorage plugin in payload.config.ts.
 * A collection missing from that list silently writes to local disk — which on
 * Vercel is read-only and ephemeral, so the file appears to upload and is gone
 * by the next deployment. That failure is invisible until someone clicks the
 * link.
 */
export const Documents: CollectionConfig = {
  slug: "documents",
  labels: { singular: "Document", plural: "Documents" },
  admin: {
    useAsTitle: "label",
    group: "Content",
    description: "PDFs offered for download — the CV, and anything like it.",
  },
  access: {
    // Public: the whole point is that a visitor can download it.
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    mimeTypes: ["application/pdf"],
    /**
     * No imageSizes. Sharp would not touch a PDF anyway, and an empty list
     * states that plainly rather than leaving a reader to wonder whether the
     * omission was an oversight.
     */
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      admin: {
        description:
          "What this document is, for your own eyes in this list — e.g. 'CV — August 2026'. Not shown to visitors.",
      },
    },
  ],
};
