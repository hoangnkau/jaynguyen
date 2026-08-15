import { resolveServerUrl } from "@/lib/server-url";

/**
 * rpID must be the registered domain, and origin must match exactly.
 * This pair is what makes a passkey phishing-proof: a credential minted for
 * jaynguyen.fyi cannot be replayed against a look-alike domain, because the
 * browser refuses to hand it over.
 */
export function rpConfig() {
  const url = new URL(resolveServerUrl());
  return {
    rpID: url.hostname,
    rpName: "jaynguyen.fyi admin",
    origin: url.origin,
  };
}

export const WEBAUTHN_OPTIONS = {
  // Biometric or PIN, not just possession of the device.
  userVerification: "required",
  // Discoverable credential: no email typed first, just tap.
  residentKey: "required",
  // Not asking for the authenticator's make and model — it would only create
  // a privacy problem we have no use for.
  attestation: "none",
} as const;
