import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";
import { resolveServerUrl } from "./src/lib/server-url";

import { Documents } from "./src/collections/Documents";
import { Media } from "./src/collections/Media";
import { Messages } from "./src/collections/Messages";
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

if (!hasBlob) {
  /**
   * This used to warn in production only, and that was the wrong way round.
   *
   * Production is the one environment where the token is correct, because
   * Vercel injects the real value itself. Development is where it is wrong —
   * `vercel env pull` writes the literal string `[SENSITIVE]` for it — and
   * development was the environment saying nothing at all.
   *
   * The cost of that silence is not theoretical. An upload made in this state
   * lands on local disk and is written into the database with a URL that
   * resolves on one laptop and nowhere else. Everything looks fine while you
   * work; the image is broken the moment it is deployed, and by then the
   * upload feels like settled history rather than the thing to re-check.
   *
   * So it warns everywhere now, and says what to do rather than what is wrong.
   */
  const detail = blobToken
    ? `BLOB_READ_WRITE_TOKEN is set but not a real token (got ${JSON.stringify(
        blobToken.slice(0, 12),
      )}…). \`vercel env pull\` cannot read Sensitive variables back — it substitutes a placeholder.`
    : "BLOB_READ_WRITE_TOKEN is not set.";

  console.warn(
    `\n[payload] Media uploads will be written to LOCAL DISK, not Vercel Blob.\n` +
      `  ${detail}\n` +
      `  Anything uploaded now exists only on this machine and will be broken in production.\n` +
      `  Fix: Vercel dashboard → Storage → your Blob store → .env.local tab → copy the real\n` +
      `  token by hand into .env.local, restart, then re-upload the file.\n`,
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
      // GUARDRAIL (blueprint §8.3): the checks that go stale over time rather
      // than at save time, run on every visit to the dashboard so that
      // noticing them is not an act of memory.
      beforeDashboard: ["@/components/admin/health-panel#HealthPanel"],
    },
  },

  editor: lexicalEditor(),
  collections: [Projects, Posts, Tags, Media, Documents, Messages, Users, Passkeys],
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
      // Every upload collection must be listed here. One that is missing
      // writes to local disk instead, which on Vercel is read-only and
      // ephemeral — the upload appears to work and the file is gone.
      collections: { media: true, documents: true },
      token: blobToken,
    }),
  ],

  typescript: { outputFile: path.resolve(dirname, "src/payload-types.ts") },
  sharp,

  // GraphQL is not used by this site; leaving it enabled would be an extra
  // public surface for no benefit.
  graphQL: { disable: true },
});
