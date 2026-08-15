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
        {
          /**
           * GUARDRAIL (blueprint §8.1) — the /about half of the rule that
           * already governs the home page.
           *
           * This page carries the longest list of claims on the whole site,
           * and until now it was the only list with nothing holding it to
           * account: forty free-text strings, no proof required. That is
           * precisely the surface the guardrail was written for.
           *
           * The link is required per GROUP rather than per individual skill.
           * Per skill would be more rigorous and would also be theatre — you
           * would end up citing the same project six times to satisfy a form,
           * and a check people route around is worse than no check. A group is
           * the smallest unit that can honestly be said to be demonstrated by
           * one piece of work.
           */
          name: "evidence",
          type: "relationship",
          relationTo: "projects",
          required: true,

          /*
           * HOW THIS FIELD WAS ADDED, because the next required field will
           * hit the same wall.
           *
           * `required: true` makes the column NOT NULL. Postgres cannot add a
           * NOT NULL column with no default to a table that already holds
           * rows, so the schema push offered to empty the table instead —
           * six skill groups deleted to satisfy a constraint whose entire
           * purpose was to protect them. Accepting that prompt is how you
           * lose data to a safety feature.
           *
           * The three-step migration costs two extra restarts and nothing
           * else:
           *
           *   1. required: false   → column added nullable, no warning
           *   2. backfill          → set Evidence on every existing row
           *   3. required: true    → no nulls left, NOT NULL applies cleanly
           *
           * Adding a required field to a populated table is a migration, not
           * an edit. Treat it like one.
           */

          admin: {
            description:
              "Which published project demonstrates this group? If you cannot name one, the group does not belong on the site.",
          },
        },
      ],
    },
    { name: "beyondWork", type: "textarea" },
  ],
};
