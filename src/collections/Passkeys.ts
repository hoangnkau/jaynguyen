import type { CollectionConfig } from "payload";

/**
 * One row per registered authenticator.
 *
 * Nothing here is a secret: a WebAuthn public key is public by design, which
 * is the point of the scheme — a breach of this table does not let anyone log
 * in, because the private key never leaves the authenticator.
 */
export const Passkeys: CollectionConfig = {
  slug: "passkeys",
  admin: { useAsTitle: "deviceName", group: "System", defaultColumns: ["deviceName", "user", "lastUsedAt"] },
  access: {
    // Never public. The credential IDs are not sensitive, but there is no
    // reason to publish a list of which authenticators guard the admin.
    read: ({ req }) => Boolean(req.user),
    create: () => false, // only the verify route creates these, via overrideAccess
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "user", type: "relationship", relationTo: "users", required: true, index: true },
    { name: "deviceName", type: "text", required: true },
    { name: "credentialID", type: "text", required: true, unique: true, index: true },
    { name: "publicKey", type: "text", required: true },
    { name: "counter", type: "number", required: true, defaultValue: 0 },
    { name: "transports", type: "text", hasMany: true },
    { name: "lastUsedAt", type: "date" },
  ],
};
