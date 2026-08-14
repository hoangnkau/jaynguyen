# jaynguyen.fyi

Personal portfolio for Khanh Hoang (Jay) Nguyen — Darwin, NT.

**Status:** Phase 1 complete (skeleton + home page). See `claude/portfolio-blueprint.md` in the Claude project for the full plan.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Styling | Tailwind CSS v4 — tokens defined in `src/app/globals.css` |
| Theme | `next-themes`, light default with dark toggle, `data-theme` attribute |
| Fonts | Inter + JetBrains Mono, **self-hosted** variable woff2 in `src/fonts/` |
| Hosting | Vercel (free tier) |
| CMS | Payload 3 + Neon Postgres — **Phase 2, not yet installed** |

---

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build — must pass before every deploy
npx eslint src --max-warnings 0
```

---

## Deploy to Vercel

1. Push this repo to GitHub (**private**).
2. vercel.com → **Add New → Project** → import the repo. Framework is detected automatically; no build settings to change.
3. Deploy. You get a `*.vercel.app` URL immediately — use it to review before the domain is attached.
4. **Project → Settings → Domains:** add `jaynguyen.fyi` and `www.jaynguyen.fyi`. Set `www` to redirect to the apex so there is exactly one canonical host.
5. Add the DNS records Vercel shows you at the registrar. SSL is issued automatically — confirm HTTPS works before telling anyone the site exists.
6. **Settings → Environment Variables:** add `NEXT_PUBLIC_SERVER_URL=https://jaynguyen.fyi`.
7. Add the property in Google Search Console the day the domain resolves.

---

## Content — where it lives right now

Everything renders from **`src/lib/site-config.ts`**. That file is temporary: Phase 2 replaces it with Payload globals and collections, and the components stay as they are. To change copy before then, edit that one file.

---

## Guardrails already enforced in code

These come from §8 of the blueprint. They are built in, not written down somewhere to remember:

| Guardrail | Where |
| --- | --- |
| Every capability must cite a project that exists, or it does not render | `src/components/home/capabilities.tsx` |
| Every skill carries a required `evidence` slug — the build fails without one | `src/lib/site-config.ts` (`Capability` type) |
| Every proof-bar number carries a `justification` (never rendered — it exists to make you pause) | `src/lib/site-config.ts` |
| No project card without a `proofUrl` | `src/components/home/featured-work.tsx` |
| Blog nav item and section stay hidden until 3 posts exist | `src/components/nav.tsx`, `blogIsLive` |
| Third-party work carries `ownerConsent`, default `false` | `src/lib/site-config.ts` (BNB Fabrics) |
| `/admin` and `/api` disallowed from indexing | `src/app/robots.ts` |
| No field anywhere for home address, phone, referees, or visa status | by omission, deliberately |
| Fonts self-hosted — no visitor IP sent to Google | `src/app/layout.tsx` |
| Secrets cannot be committed | `.githooks/pre-commit` |

**Enable the secret-scanning hook once, on this machine:**

```bash
git config core.hooksPath .githooks
```

Then install [gitleaks](https://github.com/gitleaks/gitleaks/releases). The hook fails loudly if gitleaks is missing — a scanner you assume is running but isn't is worse than none at all.

---

## Accessibility baseline

Skip-to-content link, semantic landmarks, visible focus rings, `prefers-reduced-motion` respected, no colour-only meaning. Keep it that way: every image added from Phase 2 onward requires alt text at upload.

---

## Next: Phase 2

Install Payload 3, connect Neon Postgres and Cloudflare R2, define the globals and collections listed in blueprint §5, and migrate the contents of `site-config.ts` into the CMS.
