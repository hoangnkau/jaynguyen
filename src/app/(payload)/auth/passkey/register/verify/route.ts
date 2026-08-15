import { NextResponse, type NextRequest } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers as nextHeaders } from "next/headers";
import { rpConfig, WEBAUTHN_OPTIONS } from "@/auth/webauthn";
import { takeChallenge } from "@/auth/challenge";
import { generateRecoveryCode, hashRecoveryCode } from "@/auth/session";

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const expectedChallenge = await takeChallenge();
  if (!expectedChallenge)
    return NextResponse.json({ error: "Challenge expired — try again" }, { status: 400 });

  const body = await req.json();
  const { rpID, origin } = rpConfig();

  const verification = await verifyRegistrationResponse({
    response: body.credential,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: WEBAUTHN_OPTIONS.userVerification === "required",
  });

  if (!verification.verified || !verification.registrationInfo)
    return NextResponse.json({ error: "Registration could not be verified" }, { status: 400 });

  const { credential } = verification.registrationInfo;

  await payload.create({
    collection: "passkeys",
    overrideAccess: true,
    data: {
      user: user.id,
      deviceName: String(body.deviceName || "Unnamed authenticator").slice(0, 60),
      credentialID: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
      transports: credential.transports ?? [],
    },
  });

  /**
   * A recovery code is issued alongside the FIRST passkey and shown once.
   * Blueprint §8.4: losing every authenticator with no recovery path is the
   * highest-consequence failure in this build, so the recovery code is created
   * automatically rather than left as a step to remember.
   */
  let recoveryCode: string | null = null;
  const fresh = await payload.findByID({ collection: "users", id: user.id, overrideAccess: true });
  if (!(fresh as { recoveryCodeHash?: string }).recoveryCodeHash) {
    recoveryCode = generateRecoveryCode();
    await payload.update({
      collection: "users",
      id: user.id,
      overrideAccess: true,
      data: { recoveryCodeHash: hashRecoveryCode(recoveryCode) },
    });
  }

  const count = await payload.count({
    collection: "passkeys",
    where: { user: { equals: user.id } },
    overrideAccess: true,
  });

  return NextResponse.json({ verified: true, recoveryCode, passkeyCount: count.totalDocs });
}
