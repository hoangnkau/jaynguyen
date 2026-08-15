import type { GlobalConfig } from "payload";
import { revalidateSite } from "@/lib/revalidate";

export const CV: GlobalConfig = {
  slug: "cv",
  label: "CV",
  admin: { group: "Pages" },
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    /**
     * The positioning line and the summary (blueprint §1b, item 3).
     *
     * /cv previously opened with a legal name, a suburb and an email, and then
     * went straight into a reverse-chronological list. That is a record, not a
     * claim — it makes the reader assemble the argument themselves, and the
     * argument they assemble from "IT technician → own company → Bachelor of
     * Accounting → campus coordinator" is not the one the evidence supports.
     * Six seconds of a recruiter's attention is not enough time for them to do
     * that work on your behalf.
     *
     * Both are optional at the schema level ON PURPOSE. The `required: true`
     * migration trap documented at length in globals/About.ts applies to
     * globals too: a NOT NULL column added to a table that already holds a row
     * makes the schema push offer to empty it. Nothing here is worth that, and
     * a missing summary already fails loudly enough — the section simply does
     * not render.
     */
    {
      name: "headline",
      type: "text",
      maxLength: 90,
      admin: {
        description:
          "One line under your name, e.g. 'Infrastructure & systems engineer moving into cyber security'. Job titles describe where you have been; this says what you are for.",
      },
    },
    {
      name: "summary",
      type: "textarea",
      maxLength: 700,
      admin: {
        description:
          "Three or four sentences, first person. Lead with the thing that is hardest for someone else to claim.",
      },
    },
    { name: "file", type: "upload", relationTo: "media", label: "CV PDF" },
    {
      name: "lastUpdated",
      type: "date",
      required: true,
      admin: {
        date: { pickerAppearance: "dayOnly" },
        description:
          "The admin health panel flags this when it falls behind the rest of the site. A CV that disagrees with the site is worse than no CV.",
      },
    },
    {
      name: "referencesNote",
      type: "text",
      defaultValue: "References available on request.",
      admin: {
        readOnly: true,
        description:
          "Fixed by design. Referee names and phone numbers never go on a public page.",
      },
    },
  ],
};
