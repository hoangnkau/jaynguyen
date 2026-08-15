import type { GlobalConfig } from "payload";
import { revalidateSite } from "@/lib/revalidate";

export const About: GlobalConfig = {
  slug: "about",
  admin: { group: "Pages" },
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    { name: "bio", type: "richText", required: true },
    {
      name: "timeline",
      type: "array",
      fields: [
        { name: "period", type: "text", required: true },
        { name: "role", type: "text", required: true },
        { name: "organisation", type: "text", required: true },
        { name: "bullets", type: "array", fields: [{ name: "text", type: "text", required: true }] },
      ],
    },
    {
      name: "credentials",
      type: "array",
      fields: [
        { name: "award", type: "text", required: true },
        { name: "institution", type: "text", required: true },
        { name: "year", type: "text", required: true },
        { name: "inProgress", type: "checkbox", defaultValue: false, label: "Still in progress — label it clearly" },
      ],
    },
    {
      name: "skillGroups",
      type: "array",
      fields: [
        { name: "group", type: "text", required: true },
        { name: "skills", type: "text", hasMany: true, required: true },
      ],
    },
    { name: "beyondWork", type: "textarea" },
  ],
};
