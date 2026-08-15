# jaynguyen.fyi

Personal portfolio for Khanh Hoang (Jay) Nguyen — Darwin, NT.

The full plan lives in `claude/portfolio-blueprint.md` in the Claude project. This file covers running and operating the site.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| CMS | Payload 3 at `/admin`, inside this same app |
| Database | Neon Postgres (Sydney) |
| Media | Vercel Blob — falls back to local disk when the token is absent |
| Auth | Passkey / WebAuthn, with password login as break-glass |
| Styling | Tailwind v4; tokens in `src/app/globals.css` |
| Fonts | Inter + JetBrains Mono, **self-hosted** in `src/fonts/` |
| Hosting | Vercel (Hobby) |

---

## Run locally

```bash
npm install
vercel env pull .env.local --environment=production   # then set NEXT_PUBLIC_SERVER_URL=http://localhost:3000
npm run dev            # http://localhost:3000  ·  admin at /admin
```

| Script | What it does |
| --- | --- |
| `npm run build` | Production build. Must pass before every deploy. |
| `npm run seed` | Loads the starting content into the CMS. Safe to re-run. |
| `npm run backup` | `pg_dump` into `./backups`, keeps the newest 12. |
| `npm run generate:types` | Regenerates `src/payload-types.ts` after a schema change. |
| `npm run generate:importmap` | Regenerates the admin import map after adding a plugin or custom component. |
| `npx eslint src scripts --max-warnings 0` | Lint. |

**After changing a collection or global, run both generate scripts.** A missing import-map entry produces `PayloadComponent not found in importMap` at runtime, with no build-time warning.

---

## Where the content lives

Everything the visitor reads comes from Payload, not from the codebase:

- **Pages** → Home, About, CV globals
- **Content** → Projects, Posts, Tags, Media
- **Settings** → Site Settings (name, email, socials, SEO defaults, open-to-work banner)

`src/lib/server-url.ts` is the only configuration left in code, because the canonical origin has to be known before the database is reachable.

---

## Guardrails enforced in code

From §8 of the blueprint. These are built in, not written down somewhere to remember:

| Guardrail | Where |
| --- | --- |
| A capability cannot be saved without an `evidence` project | `src/globals/Home.ts` (required relationship) |
| A capability whose evidence is gone stops rendering | `src/components/home/capabilities.tsx` |
| Every proof-bar number carries a `justification` (never rendered — it exists to make you pause) | `src/globals/Home.ts` |
| No project card without a `proofUrl` | `src/collections/Projects.ts` |
| Third-party work cannot publish without recorded `ownerConsent` | `src/collections/Projects.ts` |
| Research posts cannot publish without a York clearance tick | `src/collections/Posts.ts` |
| Drafts are unreadable by the public — access control, not a missing link | `read` access on Projects/Posts |
| Public reads never bypass access control | `overrideAccess: false` in `src/lib/queries.ts` |
| Media cannot be uploaded without real alt text | `src/collections/Media.ts` |
| The blog stays hidden until three posts are published | `blogIsLive()` |
| `/admin`, `/api`, `/auth` are never indexed | `src/app/robots.ts` + `X-Robots-Tag` |
| The whole site stays out of Google until the real domain is attached | `isLiveDomain()` |
| No field anywhere for home address, phone, referees or visa status | by omission, deliberately |
| Secrets cannot be committed | `.githooks/pre-commit` (gitleaks) |

Enable the secret-scanning hook once per machine:

```bash
git config core.hooksPath .githooks
```

---

## Authentication

Passkey login sits alongside Payload's email + password, which is **deliberately still enabled**. Turning it off before two authenticators are proven to work is how you lock yourself out.

The order that matters:

1. Sign in with the password
2. `/admin/account` → **Register a passkey** (laptop) — copy the recovery code onto paper
3. Register a second passkey (phone)
4. **Sign out and sign back in with the second one** — registering it is not proof it works
5. **New recovery code**, store it offline
6. Only then consider removing the password

**A passkey is bound to a hostname.** One registered on `localhost` will not work on `jaynguyen.fyi`. Register the real ones after the domain is live, then delete the localhost entries.

---

## Backups

```bash
npm run backup
```

Needs the PostgreSQL client on PATH (`pg_dump`). Run it monthly.

An untested backup is not a backup. Once, restore one and run the site off it:

```bash
createdb jaynguyen_restore_test
psql -d jaynguyen_restore_test -f backups/<file>.sql
DATABASE_URI=postgresql://localhost/jaynguyen_restore_test npm run dev
```

---

## Deploy

Push to `main`; Vercel builds and deploys. The build reads from Neon, so `DATABASE_URI` must be correct in Vercel — including the `-pooler` host.

Schema changes are pushed from **development only** (`push: process.env.NODE_ENV !== "production"`). A deploy that could alter the schema is a deploy that could destroy data. Run the app locally against the same database once after a schema change, then deploy.

---

## Accessibility

WCAG AA: contrast ratios are documented and measured in `globals.css`, touch targets ≥ 44px, visible focus rings, `prefers-reduced-motion` respected, alt text required at upload.

Paragraph text is justified with `hyphens: auto`, and ragged-right below 640px. Note that WCAG 1.4.8 (level **AAA**, not AA) advises against justified text; this is a deliberate stylistic choice, not an oversight.
