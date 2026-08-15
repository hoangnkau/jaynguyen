import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { rpConfig, WEBAUTHN_OPTIONS } from "@/auth/webauthn";
import { setChallenge } from "@/auth/challenge";

export async function POST() {
  const { rpID } = rpConfig();

  /**
   * No allowCredentials and no email field: the credential is discoverable, so
   * the authenticator itself offers the right account. That removes the
   * username-enumeration surface entirely — this endpoint reveals nothing
   * about who does or does not have an account.
   */
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: WEBAUTHN_OPTIONS.userVerification,
  });

  await setChallenge(options.challenge);
  return NextResponse.json(options);
}
