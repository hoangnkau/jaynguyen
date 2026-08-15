/**
 * A fixed-window counter, shared by anything that needs to say "not that many,
 * not that fast".
 *
 * THE SAME HONEST LIMITATION AS src/proxy.ts, RESTATED RATHER THAN ASSUMED
 *
 * This counter lives in the memory of one serverless instance. Vercel may run
 * several concurrently and each keeps its own tally, so an attacker spreading
 * requests around gets some multiple of the nominal limit. It is a speed bump,
 * not a wall. The correct fix is a shared store — Postgres or Vercel KV — and
 * that is a per-request round trip on a hot path, which is not justified for a
 * portfolio contact form.
 *
 * What it does buy, cheaply: an ordinary bot loop hammering the form fills one
 * instance's bucket immediately and stops writing rows to the database. That
 * is the failure this is actually protecting against, and for that it works.
 *
 * WHY THE CONTACT FORM COUNTS HERE RATHER THAN IN MIDDLEWARE
 *
 * src/proxy.ts already rate-limits the auth routes, and putting /contact
 * beside them was the first instinct. It produces a bad outcome: a Server
 * Action POST that comes back as a middleware 429 is not a response React can
 * interpret, so the visitor gets a broken fetch and a blank error instead of
 * "you have sent a few already, try again shortly". Counting inside the action
 * keeps the limit and returns a sentence a human can read.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitVerdict =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/** Bounded so a long-lived instance cannot grow this map without limit. */
function prune(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}

export function hit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitVerdict {
  const now = Date.now();
  prune(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { allowed: true };
}

/**
 * Vercel sets x-forwarded-for and it cannot be spoofed past their proxy.
 *
 * The fallback is deliberately one shared bucket rather than "allow": if the
 * header is ever missing, everybody without one queues in the same lane. The
 * failure mode should be strict, not open — the same choice src/proxy.ts
 * makes, for the same reason.
 */
export function clientKeyFrom(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
