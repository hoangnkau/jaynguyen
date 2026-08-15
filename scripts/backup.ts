import "./load-env";
import { execFileSync } from "child_process";
import { mkdirSync, readdirSync, statSync, unlinkSync } from "fs";
import path from "path";

/**
 * Content in a database is easier to lose than content in git — blueprint §8.3.
 *
 * Writes a timestamped pg_dump into ./backups and keeps the newest 12. Run it
 * monthly (Windows Task Scheduler, or by hand on the first of the month):
 *
 *   npm run backup
 *
 * An untested backup is not a backup. At least once, restore one into a local
 * Postgres and run the site off it:
 *
 *   createdb jaynguyen_restore_test
 *   psql -d jaynguyen_restore_test -f backups/<file>.sql
 *   DATABASE_URI=postgresql://localhost/jaynguyen_restore_test npm run dev
 */
const KEEP = 12;
const dir = path.resolve("backups");

function run() {
  const uri = process.env.DATABASE_URI;
  if (!uri) {
    console.error("DATABASE_URI is not set.");
    process.exit(1);
  }

  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const file = path.join(dir, `jaynguyen-${stamp}.sql`);

  try {
    // --no-owner / --no-acl so the dump restores into any local database
    // without needing the Neon role names to exist.
    execFileSync("pg_dump", ["--no-owner", "--no-acl", "-f", file, uri], {
      stdio: ["ignore", "inherit", "inherit"],
    });
  } catch {
    console.error(
      "\n  pg_dump failed. Is the PostgreSQL client installed and on PATH?\n" +
        "  Windows: install PostgreSQL and add its bin folder, e.g.\n" +
        "    C:\\\\Program Files\\\\PostgreSQL\\\\16\\\\bin\n",
    );
    process.exit(1);
  }

  const size = statSync(file).size;
  console.log(`  wrote ${path.basename(file)}  (${(size / 1024).toFixed(0)} KB)`);

  if (size < 1024) {
    console.error("  Dump is suspiciously small — check it before trusting it.");
    process.exit(1);
  }

  const dumps = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .reverse();
  dumps.slice(KEEP).forEach((f) => {
    unlinkSync(path.join(dir, f));
    console.log(`  pruned ${f}`);
  });

  console.log(`  ${Math.min(dumps.length, KEEP)} backup(s) retained in ./backups`);
}

run();
