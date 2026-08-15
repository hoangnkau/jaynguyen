import { createHmac, timingSafeEqual, randomBytes, scryptSync } from "crypto";

/**
 * A small signed-cookie session, issued only after a WebAuthn assertion has
 * been verified server-side.
 *
 * Payload's own auth strategy (see Users.ts) reads this cookie and returns the
 * matching user, so the rest of Payload — access control, the admin UI, the
 * REST API — behaves exactly as it would with password login. The passkey work
 * replaces how identity is *proven*, not how it is *used*.
 */
const COOKIE = "jn_session";
const TTL_SECONDS = 60 * 60 * 2; // 2 hours, matching the blueprint's session policy

function secret(): string {
  const s = process.env.PAYLOAD_SECRET;
  if (!s) throw new Error("PAYLOAD_SECRET is required to sign sessions.");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: number | string): string {
  const expires = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expires, mac] = parts;

  const expected = sign(`${userId}.${expires}`);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  // Constant-time compare: a length check first, because timingSafeEqual
  // throws on mismatched lengths and that throw is itself a side channel.
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  if (Number(expires) * 1000 < Date.now()) return null;
  return userId;
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_TTL = TTL_SECONDS;

/**
 * Recovery code — the answer to "what if I lose every authenticator".
 * Stored only as a scrypt hash; the plaintext is shown once and never again.
 */
export function generateRecoveryCode(): string {
  // 5 groups of 5 from an unambiguous alphabet: no O/0, no I/1.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(25);
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]);
  return [0, 5, 10, 15, 20].map((i) => chars.slice(i, i + 5).join("")).join("-");
}

export function hashRecoveryCode(code: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(code.trim().toUpperCase(), salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyRecoveryCode(code: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const hash = scryptSync(code.trim().toUpperCase(), Buffer.from(saltHex, "hex"), 64);
  const a = Buffer.from(hashHex, "hex");
  return a.length === hash.length && timingSafeEqual(a, hash);
}
