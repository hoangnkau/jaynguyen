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
