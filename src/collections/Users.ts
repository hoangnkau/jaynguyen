import type { CollectionConfig } from "payload";
import { SESSION_COOKIE, verifySessionToken } from "@/auth/session";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    /**
     * Passkey login runs as an extra strategy alongside the built-in email +
     * password one. Password login is deliberately left enabled as the
     * break-glass path: turning it off before two authenticators are proven to
     * work is exactly how you lock yourself out of your own site.
     *
     * Blueprint §8.4 — this is one of the two items no software check can
     * enforce, so it stays a conscious decision rather than a silent default.
     */
    strategies: [
      {
        name: "passkey",
        authenticate: async ({ headers, payload }) => {
          const cookie = headers.get("cookie") ?? "";
          const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
          const userId = verifySessionToken(match?.[1]);
          if (!userId) return { user: null };

          try {
            const user = await payload.findByID({
              collection: "users",
              id: userId,
              overrideAccess: true,
            });
            return user ? { user: { ...user, collection: "users" } } : { user: null };
          } catch {
            return { user: null };
          }
        },
      },
    ],
    tokenExpiration: 60 * 60 * 2, // 2 hours — blueprint §5, session policy
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 minutes
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  admin: { useAsTitle: "email", group: "System" },
  access: {
    // No public read: the user list is not a directory for anyone who finds /api.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "recoveryCodeHash",
      type: "text",
      admin: { hidden: true, readOnly: true },
      access: { read: () => false, update: () => false },
    },
    {
      name: "passkeyManager",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/passkey-manage#PasskeyManage",
        },
      },
    },
    /**
     * Passkey/WebAuthn is built and the credential records live in the
     * `passkeys` collection. Password login remains enabled on purpose — see
     * the note on `auth.strategies` above.
     *
     * A passkey is bound to a hostname: one registered on localhost will not
     * work on jaynguyen.fyi. Register the real ones on the live domain, prove
     * the second one by signing in with it, then delete the localhost entries.
     * The health panel counts them, so "I'll do it later" becomes visible
     * rather than forgotten.
     */
  ],
};
