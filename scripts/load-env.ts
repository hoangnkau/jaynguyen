import fs from "fs";
import dotenv from "dotenv";

/**
 * Loaded before payload.config so the config sees the environment.
 *
 * `import "dotenv/config"` reads .env only. Vercel writes .env.local, which is
 * also the file .gitignore protects — so that is the one that matters here.
 * Loaded first, and dotenv does not overwrite variables that already exist,
 * so a real shell variable still wins over the file.
 */
for (const file of [".env.local", ".env"]) {
  if (fs.existsSync(file)) dotenv.config({ path: file });
}

if (!process.env.PAYLOAD_SECRET || !process.env.DATABASE_URI) {
  console.error(
    "\n  Missing PAYLOAD_SECRET or DATABASE_URI.\n" +
      "  Run:  vercel env pull .env.local --environment=production\n",
  );
  process.exit(1);
}
