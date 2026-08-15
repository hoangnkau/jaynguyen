/**
 * Sending mail, over Resend's REST API, with no SDK.
 *
 * WHY NOT `npm install resend`
 *
 * The SDK wraps one POST to one URL. Taking it on would add a dependency, its
 * transitive tree, and a version to keep current, to a codebase whose whole
 * running-cost argument (blueprint §5) is that it has very few moving parts.
 * `fetch` is built in, the request below is the entire protocol surface this
 * site uses, and the failure modes are visible in this file rather than
 * underneath one.
 *
 * WHY THIS NEVER THROWS
 *
 * It returns a verdict instead. The caller has already written the message to
 * the database by the time it gets here, so a mail failure must not become an
 * exception that loses the visitor's success state. Failure is a value.
 */

const ENDPOINT = "https://api.resend.com/emails";

/** Resend is not slow, and a visitor waiting on a submit button is. */
const TIMEOUT_MS = 8000;

export type SendResult = { ok: true } | { ok: false; error: string };

type ContactPayload = {
  name: string;
  email: string;
  message: string;
  to: string;
};

/**
 * Envelope addresses, and the one that bites.
 *
 * `from` must be on a domain verified in Resend. Setting it to the visitor's
 * address is the obvious-looking move and it is wrong twice: it will not
 * authenticate (no SPF or DKIM alignment for a domain you do not control), and
 * mailbox providers treat mail claiming to be from an address it cannot prove
 * as exactly what it looks like. So the message comes FROM the site, and the
 * visitor goes in `reply_to` — where hitting Reply does the right thing.
 */
const FROM = process.env.CONTACT_FROM_EMAIL ?? "";

export function mailIsConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && FROM);
}

function plainTextBody({ name, email, message }: ContactPayload): string {
  return [
    `From:    ${name} <${email}>`,
    `Sent:    ${new Date().toISOString()}`,
    "",
    message,
    "",
    "—",
    "Sent from the contact form on jaynguyen.fyi.",
    "This message is also saved in /admin under Messages, whether or not this email arrived.",
  ].join("\n");
}

export async function sendContactNotification(
  payload: ContactPayload,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  /**
   * Missing configuration is reported, not thrown and not silently treated as
   * success. In development there is usually no API key, and the right
   * behaviour is a message that lands in Postgres and an admin row that says
   * plainly why no email went out.
   */
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not set" };
  if (!FROM) return { ok: false, error: "CONTACT_FROM_EMAIL is not set" };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      /**
       * Text only, deliberately. An HTML body would mean interpolating a
       * stranger's words into markup, and the moment you do that you have
       * taken on an escaping obligation for the sake of a nicer-looking
       * notification to yourself. JSON-encoded plain text has no such edge.
       */
      body: JSON.stringify({
        from: FROM,
        to: [payload.to],
        reply_to: payload.email,
        subject: `Portfolio contact — ${payload.name}`,
        text: plainTextBody(payload),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      // Kept verbatim and truncated rather than paraphrased: "failed to send"
      // is not something you can act on eight weeks later.
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      return { ok: false, error: `Resend ${res.status}: ${detail || "no body"}` };
    }

    return { ok: true };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return { ok: false, error: reason.slice(0, 300) };
  }
}
