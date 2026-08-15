import type { GlobalConfig } from "payload";
import { revalidateSite } from "@/lib/revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  admin: { group: "Settings" },
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    /**
     * GUARDRAIL (blueprint §8.2): there is deliberately NO field here for home
     * address, personal phone number, referee contact details, or visa status.
     * If there is no field for it, it cannot accidentally reach a public page.
     */
    { name: "name", type: "text", required: true, admin: { description: "Display name, e.g. Jay Nguyen" } },
    { name: "legalName", type: "text", required: true, admin: { description: "Full legal name — used in the footer and JSON-LD" } },
    { name: "domain", type: "text", required: true },
    { name: "location", type: "text", required: true },
    { name: "email", type: "email", required: true },
    {
      type: "collapsible",
      label: "Open to work banner",
      fields: [
        { name: "openToWorkEnabled", type: "checkbox", defaultValue: true, label: "Show the banner" },
        { name: "openToWorkPill", type: "text" },
        { name: "openToWorkHeading", type: "textarea" },
        { name: "openToWorkBody", type: "textarea" },
      ],
    },
    {
      name: "socials",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
      ],
    },
    {
      /**
       * Operational dates the health panel (§8.3) reads. They live in the CMS
       * rather than in a file because the panel runs in production, where the
       * filesystem is ephemeral and a local backup log would be invisible.
       *
       * `lastBackupAt` is stamped automatically by `npm run backup`, so it is
       * evidence rather than a note-to-self. `lastRestoreTestAt` is manual by
       * necessity — no script can confirm you sat and watched the site run off
       * a restored database, which is the only thing that makes a backup real.
       */
      type: "collapsible",
      label: "Operations",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "lastBackupAt",
          type: "date",
          label: "Last successful backup",
          admin: {
            description: "Set automatically by `npm run backup`. The health panel flags 35+ days.",
            date: { pickerAppearance: "dayOnly" },
          },
        },
        {
          name: "lastRestoreTestAt",
          type: "date",
          label: "Last verified restore",
          admin: {
            description:
              "Set this by hand after you have actually restored a dump and run the site off it. The health panel flags 180+ days.",
            date: { pickerAppearance: "dayOnly" },
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "SEO defaults",
      fields: [
        { name: "seoTitle", type: "text", required: true, maxLength: 70 },
        { name: "seoDescription", type: "textarea", required: true, maxLength: 180 },
        { name: "ogImage", type: "upload", relationTo: "media" },
      ],
    },
  ],
};
