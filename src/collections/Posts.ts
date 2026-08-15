import type { CollectionConfig } from "payload";
import { revalidateSite } from "@/lib/revalidate";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "publishedAt", "_status"],
    description:
      "The Blog link stays hidden from the site until three posts are published.",
  },
  access: {
    // GUARDRAIL (blueprint §8.1): a draft must not be reachable by guessing
    // its URL — access control, not merely an absent link.
    read: ({ req }) => (req.user ? true : { _status: { equals: "published" } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  versions: { drafts: true, maxPerDoc: 30 },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly" } },
    },
    { name: "tags", type: "relationship", relationTo: "tags", hasMany: true, admin: { position: "sidebar" } },
    {
      name: "summary",
      type: "textarea",
      required: true,
      maxLength: 240,
      admin: { description: "Shown in the blog index and used as the meta description." },
    },
    { name: "cover", type: "upload", relationTo: "media" },
    { name: "body", type: "richText", required: true },
    {
      type: "collapsible",
      label: "Research clearance",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "relatesToResearch",
          type: "checkbox",
          label: "Contains material from my MSc research",
          defaultValue: false,
        },
        {
          // GUARDRAIL (blueprint §8.1): the York study involves human
          // participants and an ethics process. Write about the questions
          // freely; findings need clearance first.
          name: "publicationCleared",
          type: "checkbox",
          label: "Checked against York's publication and ethics policy",
          defaultValue: false,
          admin: { condition: (data) => Boolean(data?.relatesToResearch) },
          validate: (value: boolean | null | undefined, { data }: { data: Record<string, unknown> }) => {
            if (data?.relatesToResearch && data?._status === "published" && !value)
              return "Cannot publish research material without confirming it is cleared.";
            return true;
          },
        },
      ],
    },
  ],
};
