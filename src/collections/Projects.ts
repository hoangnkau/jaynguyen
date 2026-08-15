import type { CollectionConfig } from "payload";
import { revalidateSite } from "@/lib/revalidate";

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "stage", "featured", "order"],
    description:
      "The home page shows every project with Featured ticked, in Order. Everything else appears on /projects.",
  },
  access: {
    // GUARDRAIL (blueprint §8.1): the public can only read published projects.
    read: ({ req }) => (req.user ? true : { _status: { equals: "published" } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar", description: "Lowercase, hyphenated. Becomes /projects/<slug>." },
    },
    {
      /**
       * Named `stage`, not `status`, deliberately.
       *
       * Payload's drafts feature creates its own `_status` column backed by an
       * enum it names `enum_projects_status`. A select field called `status`
       * generates a type with exactly that name, so the two collide: the enum
       * gets created with draft/published, then the table tries to default the
       * other column to 'building' and Postgres rejects it. Renaming the field
       * avoids the clash; the label keeps it reading as "Status" in the admin.
       */
      name: "stage",
      label: "Status",
      type: "select",
      required: true,
      defaultValue: "building",
      options: [
        { label: "Live", value: "live" },
        { label: "In build", value: "building" },
        { label: "Archived", value: "archived" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Show on the home page." },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 100,
      admin: { position: "sidebar", description: "Lower numbers appear first." },
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      maxLength: 320,
      admin: { description: "Two or three sentences. This is the card text." },
    },
    {
      name: "proofUrl",
      type: "text",
      required: true,
      label: "Proof URL",
      admin: {
        description:
          "Live site, public repo, or channel. Blueprint rule: no card without proof.",
      },
      validate: (value: string | null | undefined) =>
        !value || /^https?:\/\/.+\..+/.test(value)
          ? value
            ? true
            : "Every project needs a verifiable link."
          : "Must be a full URL starting with http:// or https://",
    },
    { name: "repoUrl", type: "text", label: "Repository URL (optional)" },
    { name: "tech", type: "text", hasMany: true, admin: { description: "Stack chips shown on the card." } },
    { name: "tags", type: "relationship", relationTo: "tags", hasMany: true },
    { name: "cover", type: "upload", relationTo: "media" },
    { name: "gallery", type: "upload", relationTo: "media", hasMany: true },
    {
      type: "collapsible",
      label: "Case study",
      admin: { initCollapsed: true },
      fields: [
        { name: "problem", type: "richText", label: "The problem" },
        { name: "built", type: "richText", label: "What I built" },
        { name: "howItWorks", type: "richText", label: "How it works" },
        { name: "learned", type: "richText", label: "What I learned" },
      ],
    },
    {
      type: "collapsible",
      label: "Third-party work",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "isThirdParty",
          type: "checkbox",
          label: "Built for someone else's business",
          defaultValue: false,
        },
        {
          // GUARDRAIL (blueprint §8.1): a third-party project cannot publish
          // until consent is recorded. This is the BNB Fabrics safeguard.
          name: "ownerConsent",
          type: "checkbox",
          label:
            "Owner approved this case study, and it contains no revenue figures, customer data, or real-order screenshots",
          defaultValue: false,
          admin: { condition: (data) => Boolean(data?.isThirdParty) },
          validate: (value: boolean | null | undefined, { data }: { data: Record<string, unknown> }) => {
            if (data?.isThirdParty && data?._status === "published" && !value)
              return "Cannot publish third-party work without recorded owner consent.";
            return true;
          },
        },
      ],
    },
  ],
};
