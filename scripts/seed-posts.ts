/**
 * Seeds the blog posts in scripts/content/*.md into Payload — as DRAFTS.
 *
 * Run:  npm run seed:posts
 *
 * WHY DRAFTS, WITHOUT AN OPTION TO CHANGE IT
 *
 * These posts were drafted for Jay, not by him. Publishing straight from a
 * script would put words on the site under his name that he has not read on
 * the rendered page, and the blog is the surface where voice matters most —
 * the projects can be verified by clicking a link, a post can only be judged
 * by whether it sounds like the person who signed it.
 *
 * So this stops at the last safe step. Read them at /admin, change whatever
 * does not sound like you, and press Publish yourself. That is not a
 * ceremonial extra step; it is the difference between your blog and mine.
 *
 * Re-running is safe: posts are upserted by slug, and a post that has already
 * been PUBLISHED is skipped rather than reverted to draft — otherwise this
 * script would quietly unpublish your live blog every time it ran.
 */
import "./load-env";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "../payload.config";
import { markdownToLexical } from "./lib/md-to-lexical";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(dirname, "content");

type Front = {
  title: string;
  slug: string;
  publishedAt: string;
  summary: string;
  tags: string[];
  relatesToResearch: boolean;
};

/**
 * A four-line header, then `---`, then the body. Not YAML — a YAML parser is a
 * dependency, and the format here is "key: value" with no nesting, no lists
 * beyond a comma-split, and no quoting rules. If this ever needs to express
 * something structured, that is the signal to take the dependency.
 */
function parse(raw: string): { front: Front; body: string } {
  const separator = raw.indexOf("\n---\n");
  if (separator === -1) throw new Error("no `---` separating the header from the body");

  const header = raw.slice(0, separator);
  const body = raw.slice(separator + 5).trim();

  const fields: Record<string, string> = {};
  for (const line of header.split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }

  for (const key of ["title", "slug", "publishedAt", "summary"]) {
    if (!fields[key]) throw new Error(`header is missing \`${key}\``);
  }

  return {
    front: {
      title: fields.title,
      slug: fields.slug,
      publishedAt: new Date(`${fields.publishedAt}T00:00:00Z`).toISOString(),
      summary: fields.summary,
      tags: (fields.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      /**
       * GUARDRAIL (blueprint §8.1). The York study involves human participants
       * and an ethics process, so anything drawing on it cannot be published
       * until the clearance box is ticked — and the validator in Posts.ts will
       * refuse the publish, not merely warn. Set here rather than inferred,
       * because a heuristic guessing at "is this research?" would eventually
       * guess wrong in the permissive direction.
       */
      relatesToResearch: fields.relatesToResearch === "true",
    },
    body,
  };
}

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function run() {
  const payload = await getPayload({ config });

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  if (!files.length) {
    console.log("No markdown files in scripts/content — nothing to do.");
    process.exit(0);
  }

  /* Tags first, so a post can reference them by ID. */
  const tagIds: Record<string, number> = {};
  const parsed = files.map((file) => {
    try {
      return { file, ...parse(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8")) };
    } catch (e) {
      throw new Error(`${file}: ${e instanceof Error ? e.message : String(e)}`);
    }
  });

  for (const name of [...new Set(parsed.flatMap((p) => p.front.tags))]) {
    const slug = slugify(name);
    const existing = await payload.find({
      collection: "tags",
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    });

    const doc = existing.docs[0]
      ? existing.docs[0]
      : await payload.create({
          collection: "tags",
          data: { name, slug },
          overrideAccess: true,
        });

    tagIds[name] = doc.id as number;
    console.log(`  tag: ${name}${existing.docs[0] ? " (existing)" : ""}`);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const { file, front, body } of parsed) {
    const existing = await payload.find({
      collection: "posts",
      where: { slug: { equals: front.slug } },
      limit: 1,
      draft: true,
      overrideAccess: true,
    });

    const current = existing.docs[0];

    if (current && (current as { _status?: string })._status === "published") {
      console.log(`  post: ${front.title}  [SKIPPED — already published, not touching it]`);
      skipped += 1;
      continue;
    }

    const data = {
      title: front.title,
      slug: front.slug,
      publishedAt: front.publishedAt,
      summary: front.summary,
      tags: front.tags.map((t) => tagIds[t]).filter(Boolean),
      body: markdownToLexical(body),
      relatesToResearch: front.relatesToResearch,
      publicationCleared: false,
      _status: "draft" as const,
    };

    if (current) {
      await payload.update({
        collection: "posts",
        id: current.id,
        data,
        draft: true,
        overrideAccess: true,
      });
      updated += 1;
    } else {
      await payload.create({
        collection: "posts",
        data,
        draft: true,
        overrideAccess: true,
      });
      created += 1;
    }

    console.log(
      `  post: ${front.title}  [DRAFT]${front.relatesToResearch ? "  ⚠ research — needs York clearance before publishing" : ""}  (${file})`,
    );
  }

  console.log(
    `\n${created} created, ${updated} updated, ${skipped} left alone.\n` +
      "All drafts. Open /admin → Posts, read them on screen, edit until they sound like you, then Publish.\n" +
      "The Blog link appears in the nav automatically once three are published.",
  );
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
