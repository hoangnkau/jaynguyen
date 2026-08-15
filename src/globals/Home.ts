import type { GlobalConfig } from "payload";
import { revalidateSite } from "@/lib/revalidate";

export const Home: GlobalConfig = {
  slug: "home",
  admin: { group: "Pages" },
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    {
      type: "collapsible",
      label: "Hero",
      fields: [
        { name: "heading", type: "text", required: true },
        { name: "tagline", type: "text", required: true },
        {
          name: "taglineAccent",
          type: "text",
          required: true,
          admin: { description: "The second half, shown in the accent colour." },
        },
        { name: "sub", type: "textarea", required: true },
      ],
    },
    {
      name: "stats",
      type: "array",
      label: "Proof bar",
      minRows: 1,
      maxRows: 4,
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
        {
          // GUARDRAIL (blueprint §8.1): never rendered. It exists so that
          // typing a number forces you to justify it first.
          name: "justification",
          type: "text",
          required: true,
          admin: {
            description:
              "Internal only, never published. How would you defend this number in an interview?",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "What I do",
      fields: [
        { name: "capabilitiesEyebrow", type: "text", defaultValue: "What I do" },
        { name: "capabilitiesTitle", type: "text", required: true },
        { name: "capabilitiesLead", type: "textarea", required: true },
        {
          name: "capabilities",
          type: "array",
          maxRows: 4,
          fields: [
            {
              name: "icon",
              type: "select",
              required: true,
              options: [
                { label: "Hardware", value: "hardware" },
                { label: "Network", value: "network" },
                { label: "Security", value: "security" },
                { label: "Finance", value: "finance" },
              ],
            },
            { name: "title", type: "text", required: true },
            { name: "body", type: "textarea", required: true },
            { name: "chips", type: "text", hasMany: true },
            {
              /**
               * GUARDRAIL (blueprint §8.1) — the most important field on the
               * whole site. A capability cannot be saved without naming the
               * project that demonstrates it, which makes "claim outruns
               * evidence" structurally impossible rather than merely
               * discouraged.
               */
              name: "evidence",
              type: "relationship",
              relationTo: "projects",
              required: true,
              admin: {
                description:
                  "Which published project demonstrates this? If you cannot name one, the capability does not belong on the site.",
              },
            },
          ],
        },
      ],
    },
    {
      name: "howIWork",
      type: "array",
      label: "How I work",
      maxRows: 4,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
        { name: "chips", type: "text", hasMany: true },
      ],
    },
    {
      type: "collapsible",
      label: "Selected work",
      fields: [
        { name: "workTitle", type: "text", required: true },
        { name: "workLead", type: "textarea", required: true },
      ],
    },
    {
      type: "collapsible",
      label: "Currently",
      fields: [
        {
          name: "currentlyUpdated",
          type: "text",
          required: true,
          admin: { description: 'e.g. "Aug 2026". Signals the site is alive — keep it honest.' },
        },
        {
          name: "currentlyItems",
          type: "array",
          fields: [
            {
              name: "text",
              type: "text",
              required: true,
              admin: { description: "Wrap emphasis in **double asterisks**." },
            },
          ],
        },
      ],
    },
  ],
};
