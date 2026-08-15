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
      /**
       * Two kinds of work, two different standards of proof.
       *
       * The rule this site is built on is not "every project has a URL" — it
       * is "every claim can be checked". A URL is simply how you check a side
       * project. It is not how you check twenty years of infrastructure work,
       * because a WAN built for a city council has no public front door and
       * never will.
       *
       * Relaxing proofUrl to let that work in would have gutted the rule.
       * Instead the rule keeps its shape and grows a second branch:
       *
       *   side       → proofUrl. Go and look at it yourself.
       *   engagement → a named client, a date range, and someone who can
       *                confirm it. Verifiable by a different route, and the
       *                route every employer already knows how to walk.
       *
       * What is NOT acceptable under either branch is an unnamed client or a
       * vague period. "A government client, some years ago" is not a claim
       * anyone can check, and it is the shape padding takes.
       */
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "side",
      options: [
        { label: "Side project — proven by a public link", value: "side" },
        { label: "Client engagement — proven by client, dates and a reference", value: "engagement" },
      ],
      admin: { position: "sidebar" },
    },
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
        // For engagements: built, handed over, and now the client's to run.
        { label: "Delivered", value: "delivered" },
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
      /**
       * GUARDRAIL (blueprint §8.1): no side project without proof.
       *
       * `required` is false at field level and enforced in `validate` instead,
       * because the requirement is conditional on `kind`. Leaving it hard-
       * required would make it impossible to record an engagement at all;
       * dropping the check would make it optional for everyone. The validator
       * is the only place that can say "mandatory here, meaningless there".
       */
      name: "proofUrl",
      type: "text",
      required: false,
      label: "Proof URL",
      admin: {
        condition: (data) => data?.kind !== "engagement",
        description:
          "Live site, public repo, or channel. Blueprint rule: no side project without proof.",
      },
      validate: (
        value: string | null | undefined,
        { data }: { data: Record<string, unknown> },
      ) => {
        if (data?.kind === "engagement") return true;
        if (!value) return "Every side project needs a verifiable link.";
        return /^https?:\/\/.+\..+/.test(value)
          ? true
          : "Must be a full URL starting with http:// or https://";
      },
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
      label: "Client engagement",
      admin: { condition: (data) => data?.kind === "engagement" },
      fields: [
        {
          name: "client",
          type: "text",
          label: "Client",
          admin: {
            description:
              "Named, not described. \"Bien Hoa City People's Committee\", not \"a government client\".",
          },
          validate: (value: string | null | undefined, { data }: { data: Record<string, unknown> }) => {
            if (data?.kind !== "engagement") return true;
            return value?.trim() ? true : "An engagement must name its client.";
          },
        },
        {
          name: "period",
          type: "text",
          label: "Period",
          admin: { description: 'e.g. "2015–2017". A range, not "several years ago".' },
          validate: (value: string | null | undefined, { data }: { data: Record<string, unknown> }) => {
            if (data?.kind !== "engagement") return true;
            if (!value?.trim()) return "An engagement must state when it happened.";
            return /\d{4}/.test(value) ? true : "Include at least one four-digit year.";
          },
        },
        {
          name: "roleHeld",
          type: "text",
          label: "The role you actually held at the time",
          admin: {
            description:
              "Must match your timeline for those dates. If you were a technician then, say technician — a title that does not survive the second interview question takes the rest of the page down with it.",
          },
          validate: (value: string | null | undefined, { data }: { data: Record<string, unknown> }) => {
            if (data?.kind !== "engagement") return true;
            return value?.trim() ? true : "Name the role you held, as your CV states it.";
          },
        },
        {
          /**
           * GUARDRAIL: the engagement equivalent of proofUrl. A reader cannot
           * click an engagement, so the check is that someone can vouch for
           * it. Ticking this is a commitment that you could produce that
           * person if asked — which is exactly the commitment a live URL makes
           * on the other branch.
           */
          name: "referenceAvailable",
          type: "checkbox",
          label: "I can name someone who would confirm this work if asked",
          defaultValue: false,
          validate: (value: boolean | null | undefined, { data }: { data: Record<string, unknown> }) => {
            if (data?.kind !== "engagement" || data?._status !== "published") return true;
            return value
              ? true
              : "An engagement with nobody to confirm it is not verifiable. Do not publish it.";
          },
        },
        {
          /**
           * GUARDRAIL: infrastructure write-ups are reconnaissance material.
           *
           * Describing the architecture of a government network in public is
           * not the same as describing your own e-commerce app. Topology, IP
           * ranges, vendor and firmware versions, device counts and site lists
           * are all useful to someone mapping a target — and the client never
           * agreed to publish them.
           *
           * Write about the decisions and the trade-offs, which are yours.
           * Leave out the map, which is theirs.
           */
          name: "disclosureChecked",
          type: "checkbox",
          label:
            "Contains no topology, addressing, device counts, firmware versions or site lists — decisions only, nothing that helps someone attack this client",
          defaultValue: false,
          validate: (value: boolean | null | undefined, { data }: { data: Record<string, unknown> }) => {
            if (data?.kind !== "engagement" || data?._status !== "published") return true;
            return value
              ? true
              : "Confirm the write-up is free of operational detail before publishing it.";
          },
        },
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
