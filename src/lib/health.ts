import { getPayload } from "payload";
import config from "@payload-config";

/**
 * The checks behind the admin health panel (blueprint §8.3).
 *
 * The blueprint converts every warning it makes into something that enforces
 * itself, because a list of warnings is useless — in eight months nobody
 * rereads it. Most of those became required fields or access rules. These
 * eleven could not: they are conditions that go bad over TIME rather than at
 * the moment of saving. A backup gets old. A project gets unpublished and
 * orphans a claim that cites it. The CV drifts out of step with the site.
 *
 * Nothing can stop those at write time, so they were left as "remember to
 * check" — which is the failure the whole section exists to prevent. This
 * panel is the answer: the checks run on every visit to /admin, so noticing
 * costs ten seconds of looking rather than an act of memory.
 *
 * Design rule: every red row states the fix, not just the fault.
 *
 * WHY THIS IS NOT A COMPONENT
 *
 * These checks are time-dependent by their nature — "how many days since the
 * last backup" has no meaning without reading the clock. React's purity rule
 * correctly refuses to let a component call Date.now() in its body: a value
 * that changes on every render is exactly what a component must not compute.
 *
 * So the clock-reading lives here, in a plain async function, and the
 * component does nothing but render what it returns. The linter caught this
 * and it was right to.
 */

export type Row = {
  label: string;
  ok: boolean;
  detail: string;
  critical?: boolean;
};

const DAY = 24 * 60 * 60 * 1000;
const daysSince = (d: string | null | undefined) =>
  d ? Math.floor((Date.now() - new Date(d).getTime()) / DAY) : null;

/**
 * A relationship read with overrideAccess: false comes back as a full object
 * when the related document is publicly visible, and as a bare ID when it is
 * not. That is exactly the test we want: "would a visitor see the proof?"
 */
const isVisible = (v: unknown) => typeof v === "object" && v !== null;

type Evidenced = { evidence?: unknown; title?: string | null; group?: string | null };

function orphans(rows: Evidenced[] | null | undefined, name: (r: Evidenced) => string) {
  return (rows ?? []).filter((r) => !isVisible(r.evidence)).map(name);
}

/** Parses the free-text "Currently" stamp, e.g. "Aug 2026". */
function parseMonthYear(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(`1 ${s.trim()}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function collectHealthRows(): Promise<Row[]> {
  const payload = await getPayload({ config });

  // Read the globals exactly as the public site does, so what this panel
  // judges is what a visitor actually gets — not what the database holds.
  const PUBLIC = { overrideAccess: false } as const;

  const [settings, home, about, cv, projects, posts, media, passkeys, users] =
    await Promise.all([
      payload.findGlobal({ slug: "site-settings", depth: 0 }),
      payload.findGlobal({ slug: "home", depth: 2, ...PUBLIC }),
      payload.findGlobal({ slug: "about", depth: 2, ...PUBLIC }),
      payload.findGlobal({ slug: "cv", depth: 0 }),
      payload.find({ collection: "projects", limit: 200, depth: 0, overrideAccess: true }),
      payload.find({
        collection: "posts",
        limit: 200,
        depth: 0,
        sort: "-publishedAt",
        overrideAccess: true,
      }),
      payload.find({ collection: "media", limit: 500, depth: 0, overrideAccess: true }),
      payload.count({ collection: "passkeys", overrideAccess: true }),
      payload.find({ collection: "users", limit: 10, depth: 0, overrideAccess: true }),
    ]);

  const rows: Row[] = [];

  /* ----------------------------------------------------------- security -- */

  const keyCount = passkeys.totalDocs;
  rows.push({
    label: "Registered passkeys",
    ok: keyCount >= 2,
    critical: true,
    detail:
      keyCount >= 2
        ? `${keyCount} authenticators registered.`
        : keyCount === 1
          ? "Only one. Register a second on a different device — one lost phone is currently a lockout."
          : "None. The admin is protected by a password alone. Register two, on two devices.",
  });

  const hasRecovery = users.docs.some((u) =>
    Boolean((u as { recoveryCodeHash?: string | null }).recoveryCodeHash),
  );
  rows.push({
    label: "Recovery code",
    ok: hasRecovery,
    critical: true,
    detail: hasRecovery
      ? "A code is set. It works once — if you have used it, mint a new one."
      : "No recovery code is set. Generate one from your account page and put it on paper.",
  });

  /* ------------------------------------------------------------- claims -- */

  const orphanCaps = orphans(
    (home as { capabilities?: Evidenced[] }).capabilities,
    (c) => c.title ?? "untitled",
  );
  rows.push({
    label: "Home capabilities cite live proof",
    ok: orphanCaps.length === 0,
    detail:
      orphanCaps.length === 0
        ? "Every capability points at a published project."
        : `Hidden from the site because their evidence is no longer public: ${orphanCaps.join(", ")}.`,
  });

  const orphanSkills = orphans(
    (about as { skillGroups?: Evidenced[] }).skillGroups,
    (g) => g.group ?? "unnamed group",
  );
  rows.push({
    label: "Skill groups cite live proof",
    ok: orphanSkills.length === 0,
    detail:
      orphanSkills.length === 0
        ? "Every group on /about points at a published project."
        : `Hidden from /about because their evidence is no longer public: ${orphanSkills.join(", ")}.`,
  });

  const published = projects.docs.filter(
    (p) => (p as { _status?: string })._status === "published",
  );

  const noProof = published.filter(
    (p) => !/^https?:\/\//.test(String((p as { proofUrl?: string }).proofUrl ?? "")),
  );
  rows.push({
    label: "Published projects have a proof link",
    ok: noProof.length === 0,
    detail:
      noProof.length === 0
        ? `${published.length} published, all with a verifiable URL.`
        : `Missing a usable proofUrl: ${noProof.map((p) => (p as { title?: string }).title).join(", ")}.`,
  });

  const unconsented = published.filter(
    (p) =>
      (p as { isThirdParty?: boolean }).isThirdParty &&
      !(p as { ownerConsent?: boolean }).ownerConsent,
  );
  rows.push({
    label: "Third-party work has recorded consent",
    ok: unconsented.length === 0,
    critical: true,
    detail:
      unconsented.length === 0
        ? "No published project belongs to someone else without their sign-off."
        : `Published without consent: ${unconsented.map((p) => (p as { title?: string }).title).join(", ")}. Unpublish now.`,
  });

  /* ---------------------------------------------------------- freshness -- */

  const newestContent = [...projects.docs, ...posts.docs]
    .map((d) => new Date((d as { updatedAt: string }).updatedAt).getTime())
    .concat([new Date((home as { updatedAt: string }).updatedAt).getTime()])
    .concat([new Date((about as { updatedAt: string }).updatedAt).getTime()])
    .reduce((a, b) => Math.max(a, b), 0);

  const cvUpdated = (cv as { lastUpdated?: string | null }).lastUpdated;
  const cvStale = !cvUpdated || new Date(cvUpdated).getTime() < newestContent;
  rows.push({
    label: "CV is no older than the site",
    ok: !cvStale,
    detail: cvStale
      ? "Content has changed since the CV was last updated. A recruiter who sees the two disagree believes the CV."
      : `CV stamped ${new Date(cvUpdated).toLocaleDateString("en-AU")}.`,
  });

  const currentlyAt = parseMonthYear(
    (home as { currentlyUpdated?: string | null }).currentlyUpdated,
  );
  const currentlyDays = currentlyAt
    ? Math.floor((Date.now() - currentlyAt.getTime()) / DAY)
    : null;
  rows.push({
    label: '"Currently" block is recent',
    ok: currentlyDays !== null && currentlyDays < 150,
    detail:
      currentlyDays === null
        ? 'Could not read the date. Use a "Mon YYYY" format, e.g. "Aug 2026".'
        : currentlyDays < 150
          ? `Stamped ${currentlyDays} days ago.`
          : `Stamped ${currentlyDays} days ago. This is the field that proves the site is alive — refresh it.`,
  });

  const livePosts = posts.docs.filter(
    (p) => (p as { _status?: string })._status === "published",
  );
  const blogLive = livePosts.length >= 3;
  const lastPostDays = daysSince(
    (livePosts[0] as { publishedAt?: string } | undefined)?.publishedAt,
  );
  rows.push({
    label: "Blog",
    ok: !blogLive || (lastPostDays !== null && lastPostDays <= 45),
    detail: !blogLive
      ? `Hidden from the nav: ${livePosts.length} of 3 posts published. Nothing is wrong — the site is refusing to show an empty blog.`
      : lastPostDays !== null && lastPostDays <= 45
        ? `Last post ${lastPostDays} days ago.`
        : `Last post ${lastPostDays} days ago. A blog that stops damages credibility more than no blog.`,
  });

  const noAlt = media.docs.filter((m) => !String((m as { alt?: string }).alt ?? "").trim());
  rows.push({
    label: "Every image has alt text",
    ok: noAlt.length === 0,
    detail:
      noAlt.length === 0
        ? `${media.totalDocs} files, all described.`
        : `${noAlt.length} without alt text.`,
  });

  /* --------------------------------------------------------- operations -- */

  const ops = settings as { lastBackupAt?: string | null; lastRestoreTestAt?: string | null };
  const backupDays = daysSince(ops.lastBackupAt);
  rows.push({
    label: "Database backup",
    ok: backupDays !== null && backupDays <= 35,
    detail:
      backupDays === null
        ? "Never recorded. Run `npm run backup`, then stamp the date in Site Settings."
        : backupDays <= 35
          ? `Last taken ${backupDays} days ago.`
          : `Last taken ${backupDays} days ago. Content in a database is easier to lose than content in git.`,
  });

  const restoreDays = daysSince(ops.lastRestoreTestAt);
  rows.push({
    label: "Backup restore tested",
    ok: restoreDays !== null && restoreDays <= 180,
    detail:
      restoreDays === null
        ? "Never verified. An untested backup is not a backup — restore one into a local Postgres once."
        : restoreDays <= 180
          ? `Verified ${restoreDays} days ago.`
          : `Verified ${restoreDays} days ago. Time to prove it still restores.`,
  });

  return rows;
}
