import { NextResponse, type NextRequest } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE, SESSION_TTL, createSessionToken, verifyRecoveryCode,
} from "@/auth/session";

/**
 * The break-glass path: every authenticator lost, one code on paper.
 *
 * Consuming the code clears it, so it works exactly once — after using it you
 * are signed in and must register a new passkey, which issues a fresh code.
 * Blueprint §8.4.
 */
export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code)
    return NextResponse.json({ error: "Email and recovery code required" }, { status: 400 });

  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "users",
    where: { email: { equals: String(email).toLowerCase() } },
    limit: 1,
    overrideAccess: true,
  });

  const user = found.docs[0];
  const stored = (user as { recoveryCodeHash?: string } | undefined)?.recoveryCodeHash;

  // Same response either way: a wrong email and a wrong code are
  // indistinguishable from outside, so this cannot be used to test emails.
  if (!user || !verifyRecoveryCode(String(code), stored))
    return NextResponse.json({ error: "Invalid email or recovery code" }, { status: 401 });

  await payload.update({
    collection: "users",
    id: user.id,
    overrideAccess: true,
    data: { recoveryCodeHash: null },
  });

  (await cookies()).set(SESSION_COOKIE, createSessionToken(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL,
  });

  return NextResponse.json({ verified: true });
}
