import { NextResponse, type NextRequest } from "next/server";

/**
 * Rate limiting for the authentication endpoints (blueprint §5, defence in
 * depth).
 *
 * WHAT THIS DOES AND DOES NOT COVER
 *
 * Payload already throttles its own email + password login: `maxLoginAttempts:
 * 5` with a 15-minute lock, held in the database and therefore correct across
 * every serverless instance. That path was never the gap.
 *
 * The gap is the hand-written WebAuthn routes under /auth/passkey, and one of
 * them matters far more than the rest: /auth/passkey/recover accepts an email
 * and a recovery code and, on a match, issues a session. Nothing stood between
 * an attacker and an unlimited number of guesses at it. The code itself is
 * high-entropy and scrypt-hashed, so an unthrottled endpoint is not
 * immediately fatal — but "the maths saves us" is a reason to add the limit
 * calmly, not a reason to skip it.
 *
 * THE HONEST LIMITATION, STATED RATHER THAN HIDDEN
 *
 * This counter lives in the memory of one serverless instance. Vercel may run
 * several concurrently, and each keeps its own count, so a determined attacker
 * spreading requests across instances gets a multiple of the nominal limit.
 * It is a speed bump, not a wall.
 *
 * The correct fix is a shared store — Postgres, or Vercel KV. That is a real
 * piece of work and a per-request database round trip on the hot path, and it
 * is not justified for a personal portfolio whose sensitive endpoint is
 * already protected by a high-entropy secret. So: the cheap control goes in
 * now, the limitation is written down here rather than assumed away, and if
 * this site ever holds something worth attacking, this comment is the note
 * telling you exactly what to replace.
 */

type Bucket = { count: number; resetAt: number };

const hits = new Map<string, Bucket>();

/** Windows chosen so a normal person never meets them. */
const RULES: { prefix: string; limit: number; windowMs: number }[] = [
  // Two requests per attempt (options, then verify), so this is ~7 tries.
  { prefix: "/auth/passkey/recover", limit: 5, windowMs: 15 * 60_000 },
  { prefix: "/auth/passkey/login", limit: 15, windowMs: 5 * 60_000 },
  { prefix: "/auth/passkey/register", limit: 15, windowMs: 5 * 60_000 },
  { prefix: "/auth", limit: 30, windowMs: 5 * 60_000 },
];

function ruleFor(pathname: string) {
  return RULES.find((r) => pathname.startsWith(r.prefix));
}

/**
 * Vercel sets x-forwarded-for and it cannot be spoofed past their proxy. The
 * fallback is deliberately a single shared bucket rather than "allow": if the
 * header is ever missing, the failure mode should be strict, not open.
 */
function clientKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function prune(now: number) {
  if (hits.size < 500) return;
  for (const [key, bucket] of hits) if (bucket.resetAt <= now) hits.delete(key);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rule = ruleFor(pathname);
  if (!rule) return NextResponse.next();

  const now = Date.now();
  prune(now);

  const key = `${clientKey(req)}:${rule.prefix}`;
  const bucket = hits.get(key);

  if (!bucket || bucket.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + rule.windowMs });
    return NextResponse.next();
  }

  bucket.count += 1;

  if (bucket.count > rule.limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  // Only the auth surface. The admin UI and the public site are untouched, so
  // nothing here can slow down or break an ordinary page view.
  matcher: ["/auth/:path*"],
};
