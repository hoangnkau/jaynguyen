import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers as nextHeaders } from "next/headers";
import { generateRecoveryCode, hashRecoveryCode } from "@/auth/session";

/**
 * Mint a fresh recovery code, invalidating the previous one.
 *
 * Needed because the code is issued with the FIRST passkey, and a passkey is
 * bound to a hostname. Registering one on localhost to try the flow would
 * otherwise burn the only code you ever get, leaving you with a code from a
 * throwaway test as your one route back in on the real domain.
 *
 * Requires an active session: the person rotating the code must already be
 * signed in, so this is not a way to lock someone else out.
 */
export async function POST() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const recoveryCode = generateRecoveryCode();
  await payload.update({
    collection: "users",
    id: user.id,
    overrideAccess: true,
    data: { recoveryCodeHash: hashRecoveryCode(recoveryCode) },
  });

  return NextResponse.json({ recoveryCode });
}
