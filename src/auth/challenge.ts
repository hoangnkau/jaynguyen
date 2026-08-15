import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * The WebAuthn challenge is stored in a short-lived signed cookie rather than
 * in the database. It is single-use by construction: each request overwrites
 * it, and verification clears it. Nothing about the challenge is secret — what
 * matters is that the server chose it and that it cannot be replayed.
 */
const NAME = "jn_webauthn_challenge";
const TTL = 120; // seconds

const mac = (v: string) =>
  createHmac("sha256", process.env.PAYLOAD_SECRET ?? "").update(v).digest("base64url");

export async function setChallenge(challenge: string) {
  const expires = Math.floor(Date.now() / 1000) + TTL;
  const payload = `${challenge}.${expires}`;
  (await cookies()).set(NAME, `${payload}.${mac(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL,
  });
}

export async function takeChallenge(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(NAME)?.value;
  jar.delete(NAME); // single use, whether or not it validates
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [challenge, expires, sig] = parts;

  const expected = mac(`${challenge}.${expires}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expires) * 1000 < Date.now()) return null;

  return challenge;
}
