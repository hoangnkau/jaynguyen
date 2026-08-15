import type { CollectionConfig } from "payload";

/**
 * Contact form submissions (blueprint §3.6, Phase 7).
 *
 * WHY THE DATABASE IS THE SOURCE OF TRUTH AND EMAIL IS ONLY A NOTIFICATION
 *
 * The old /contact page carried a comment saying a form that silently fails is
 * worse than no form. That is the entire design constraint, and the usual
 * implementation walks straight into it: validate, call the mail provider,
 * show a tick. If the provider is down, over quota, or the sending domain has
 * drifted out of verification, the visitor is told their message was sent and
 * nobody ever sees it. The failure is invisible on both ends, which is the
 * worst possible shape for a failure to have.
 *
 * So the write happens here first. The email is a convenience that saves Jay
 * from checking /admin, and if it fails the message is still recorded — with
 * `deliveredByEmail` false and the provider's own error kept in
 * `deliveryError`, so the health panel can say so out loud rather than the
 * whole thing evaporating.
 *
 * WHAT IS DELIBERATELY NOT STORED
 *
 * No IP address, no user agent, no referrer. A portfolio contact form has no
 * business building a log of who visited it, and the same §8.2 reasoning that
 * keeps a home-address field out of Site Settings applies here: if there is no
 * field for it, it cannot leak. Abuse control is the rate limiter in
 * src/lib/rate-limit.ts, which counts in memory and stores nothing.
 */
export const Messages: CollectionConfig = {
  slug: "messages",
  labels: { singular: "Message", plural: "Messages" },
  admin: {
    group: "Content",
    useAsTitle: "name",
    defaultColumns: ["name", "email", "handled", "deliveredByEmail", "createdAt"],
    description:
      "Contact form submissions. Recorded here first, emailed second — so a mail outage loses a notification, never a message.",
  },
  access: {
    /**
     * Nothing public may read this, ever — an unauthenticated visitor must not
     * be able to list or guess at somebody else's message.
     *
     * `create` is false for the same reason it looks wrong at first glance:
     * the public REST endpoint at /api/messages would otherwise accept
     * anything anyone posts to it, bypassing every check in the server action.
     * The one legitimate writer is submitContactMessage(), which validates,
     * rate-limits, and then writes with overrideAccess: true precisely because
     * it has earned the right to. Closing the door here means the action is
     * the only door.
     */
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "email", type: "email", required: true },
    { name: "message", type: "textarea", required: true, maxLength: 4000 },
    {
      name: "handled",
      type: "checkbox",
      defaultValue: false,
      label: "Replied / dealt with",
      admin: {
        position: "sidebar",
        description: "Tick when you have answered. Nothing on the public site reads this.",
      },
    },
    {
      name: "deliveredByEmail",
      type: "checkbox",
      defaultValue: false,
      label: "Notification email sent",
      admin: {
        position: "sidebar",
        readOnly: true,
        description:
          "Set by the server action. If this is off, the message reached the database but never reached your inbox.",
      },
    },
    {
      name: "deliveryError",
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
        condition: (data) => !data?.deliveredByEmail,
        description: "Whatever the mail provider said. Kept verbatim — a paraphrased error is a lost error.",
      },
    },
  ],
  timestamps: true,
};
