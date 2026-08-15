import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers as nextHeaders } from "next/headers";
import { rpConfig, WEBAUTHN_OPTIONS } from "@/auth/webauthn";
import { setChallenge } from "@/auth/challenge";

export async function POST() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });

  // Registering a passkey requires already being signed in — by password the
  // first time, or by an existing passkey when adding a second authenticator.
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { rpID, rpName } = rpConfig();

  const existing = await payload.find({
    collection: "passkeys",
    where: { user: { equals: user.id } },
    limit: 50,
    overrideAccess: true,
  });

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.email,
    userDisplayName: (user as { name?: string }).name ?? user.email,
    attestationType: WEBAUTHN_OPTIONS.attestation,
    // Stops the same authenticator being registered twice.
    excludeCredentials: existing.docs.map((d) => ({ id: d.credentialID })),
    authenticatorSelection: {
      residentKey: WEBAUTHN_OPTIONS.residentKey,
      userVerification: WEBAUTHN_OPTIONS.userVerification,
    },
  });

  await setChallenge(options.challenge);
  return NextResponse.json(options);
}
