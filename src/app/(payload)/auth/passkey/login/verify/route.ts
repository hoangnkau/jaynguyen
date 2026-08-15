import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";
import { rpConfig, WEBAUTHN_OPTIONS } from "@/auth/webauthn";
import { takeChallenge } from "@/auth/challenge";
import { SESSION_COOKIE, SESSION_TTL, createSessionToken } from "@/auth/session";

export async function POST(req: NextRequest) {
  const expectedChallenge = await takeChallenge();
  if (!expectedChallenge)
    return NextResponse.json({ error: "Challenge expired — try again" }, { status: 400 });

  const body = await req.json();
  const payload = await getPayload({ config });
  const { rpID, origin } = rpConfig();

  const found = await payload.find({
    collection: "passkeys",
    where: { credentialID: { equals: body.credential?.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const record = found.docs[0];
  if (!record)
    return NextResponse.json({ error: "Unknown authenticator" }, { status: 401 });

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body.credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: WEBAUTHN_OPTIONS.userVerification === "required",
      credential: {
        id: record.credentialID,
        publicKey: new Uint8Array(Buffer.from(record.publicKey, "base64url")),
        counter: record.counter,
        transports: (record.transports ?? []) as never,
      },
    });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 401 });
  }

  if (!verification.verified)
    return NextResponse.json({ error: "Verification failed" }, { status: 401 });

  /**
   * The signature counter must move forward. A counter that goes backwards
   * means the same credential is in use in two places — the signature of a
   * cloned authenticator. Refuse rather than log and continue.
   */
  const newCounter = verification.authenticationInfo.newCounter;
  if (record.counter > 0 && newCounter <= record.counter)
    return NextResponse.json({ error: "Replay detected" }, { status: 401 });

  await payload.update({
    collection: "passkeys",
    id: record.id,
    overrideAccess: true,
    data: { counter: newCounter, lastUsedAt: new Date().toISOString() },
  });

  const userId = typeof record.user === "object" ? record.user.id : record.user;

  (await cookies()).set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL,
  });

  return NextResponse.json({ verified: true });
}
