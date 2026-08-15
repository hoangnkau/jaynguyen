import type { GlobalConfig } from "payload";
import { revalidateSite } from "@/lib/revalidate";

export const CV: GlobalConfig = {
  slug: "cv",
  label: "CV",
  admin: { group: "Pages" },
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
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
