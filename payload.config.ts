import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";
import { resolveServerUrl } from "./src/lib/server-url";

import { Media } from "./src/collections/Media";
import { Posts } from "./src/collections/Posts";
import { Projects } from "./src/collections/Projects";
import { Tags } from "./src/collections/Tags";
import { Users } from "./src/collections/Users";
import { Passkeys } from "./src/collections/Passkeys";
import { About } from "./src/globals/About";
import { CV } from "./src/globals/CV";
import { Home } from "./src/globals/Home";
import { SiteSettings } from "./src/globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vercel marks BLOB_READ_WRITE_TOKEN as a Sensitive variable, and sensitive
 * variables cannot be read back — `vercel env pull` returns a placeholder, not
 * the real token. So the token is validated here rather than assumed.
 *
 * Without a valid token, uploads fall back to local disk. That is exactly what
 * you want for local development and for the seed script, which uploads
 * nothing: a missing blob token should not stop you working. Production has
 * the real value injected by Vercel at build time.
 */
const blobToken = process.env.BLOB_READ_WRITE_TOKEN ?? "";
const hasBlob = /^vercel_blob_rw_[A-Za-z0-9_]+$/.test(blobToken);

if (!hasBlob && process.env.NODE_ENV === "production") {
  console.warn(
    "[payload] BLOB_READ_WRITE_TOKEN missing or malformed — media uploads will use local disk, which is ephemeral on Vercel.",
  );
}

export default buildConfig({
  serverURL: resolveServerUrl(),
  secret: process.env.PAYLOAD_SECRET || "",

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " — jaynguyen.fyi admin",
      // GUARDRAIL (blueprint §8.2): the admin is never indexed.
      robots: "noindex, nofollow",
    },
    components: {
      afterLogin: ["@/components/admin/passkey-login#PasskeyLogin"],
    },
  },

  editor: lexicalEditor(),
  collections: [Projects, Posts, Tags, Media, Users, Passkeys],
  globals: [SiteSettings, Home, About, CV],

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
    // Neon's pooler is PgBouncer in transaction mode; Payload/Drizzle needs
    // this off to avoid prepared-statement collisions across pooled sessions.
    push: process.env.NODE_ENV !== "production",
  }),

  plugins: [
    vercelBlobStorage({
      enabled: hasBlob,
      collections: { media: true },
      token: blobToken,
    }),
  ],

  typescript: { outputFile: path.resolve(dirname, "src/payload-types.ts") },
  sharp,

  // GraphQL is not used by this site; leaving it enabled would be an extra
  // public surface for no benefit.
  graphQL: { disable: true },
});
