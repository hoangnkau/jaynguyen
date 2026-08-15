"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import type { ContactState } from "@/lib/contact-state";
import { mailIsConfigured, sendContactNotification } from "@/lib/email";
import { clientKeyFrom, hit } from "@/lib/rate-limit";
import { getSiteSettings } from "@/lib/queries";

/**
 * The contact form's server action (blueprint §3.6, Phase 7).
 *
 * ORDER OF OPERATIONS, WHICH IS THE WHOLE DESIGN
 *
 *   1. honeypot        — costs nothing, catches the dumb majority
 *   2. rate limit      — before any work, so a flood is cheap to refuse
 *   3. validate        — before touching the database
 *   4. WRITE           — the message is now safe
 *   5. notify by email — best effort; its failure is recorded, not raised
 *
 * Step 4 before step 5 is the point. See src/collections/Messages.ts for why a
 * form whose only destination is an inbox is a form that loses messages.
 */

/**
 * NOTE: this file exports exactly one thing, and it must stay that way.
 * `"use server"` turns every export into a callable endpoint, so only async
 * functions are permitted — the state type and its initial value live in
 * @/lib/contact-state for that reason.
 */

/** Five an hour is generous for a human and useless to a bot. */
const LIMIT = { limit: 5, windowMs: 60 * 60_000 };

const LIMITS = {
  name: { min: 2, max: 120 },
  message: { min: 20, max: 4000 },
  email: { max: 254 },
} as const;

/**
 * Deliberately permissive. Email addresses that are legal and that a strict
 * pattern rejects are common enough that over-validating here means silently
 * refusing real people; the address is proven by replying to it, not by a
 * regular expression. This catches typos and obvious nonsense, nothing more.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

export async function submitContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = str(formData.get("name"));
  const email = str(formData.get("email"));
  const message = str(formData.get("message"));
  const values = { name, email, message };

  /**
   * The honeypot. `company` is off-screen and hidden from assistive
   * technology, so a person never fills it in and a form-filling bot usually
   * does. A caught bot is told the message was sent — telling it the truth
   * only teaches whoever wrote it which field to skip next time.
   */
  if (str(formData.get("company"))) {
    return { status: "success", message: "Thanks — your message has been sent." };
  }

  const requestHeaders = await headers();
  const verdict = hit(`contact:${clientKeyFrom(requestHeaders)}`, LIMIT);
  if (!verdict.allowed) {
    const minutes = Math.ceil(verdict.retryAfterSeconds / 60);
    return {
      status: "error",
      message: `That is a few messages in a short time. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"} — or just email me directly, which always works.`,
      values,
    };
  }

  const fieldErrors: ContactState["fieldErrors"] = {};
  if (name.length < LIMITS.name.min) fieldErrors.name = "Please give me a name to reply to.";
  else if (name.length > LIMITS.name.max) fieldErrors.name = "That name is longer than this field allows.";

  if (!email) fieldErrors.email = "I need an address to reply to.";
  else if (email.length > LIMITS.email.max || !EMAIL.test(email))
    fieldErrors.email = "That does not look like an email address.";

  if (message.length < LIMITS.message.min)
    fieldErrors.message = `A bit more detail, please — at least ${LIMITS.message.min} characters.`;
  else if (message.length > LIMITS.message.max)
    fieldErrors.message = `That is over ${LIMITS.message.max} characters. Send me the short version and we can talk properly.`;

  if (Object.keys(fieldErrors).length) {
    return {
      status: "error",
      message: "Almost — a couple of fields need another look.",
      fieldErrors,
      values,
    };
  }

  try {
    const payload = await getPayload({ config });
    const settings = await getSiteSettings();

    /**
     * overrideAccess: true, on purpose and only here.
     *
     * Messages.create is closed to everyone (see the collection), which shuts
     * the public REST endpoint. This action is the single writer that has
     * earned the right, having just done the checks that endpoint would skip.
     */
    const created = await payload.create({
      collection: "messages",
      data: { name, email, message, handled: false, deliveredByEmail: false },
      overrideAccess: true,
    });

    const sent = mailIsConfigured()
      ? await sendContactNotification({ name, email, message, to: settings.email })
      : ({ ok: false, error: "Mail is not configured in this environment" } as const);

    if (!sent.ok) {
      // Recorded against the row so the admin can see a message arrived but
      // the notification did not. Failing to record the failure would put us
      // back where we started.
      await payload.update({
        collection: "messages",
        id: created.id,
        data: { deliveryError: sent.error },
        overrideAccess: true,
      });
      console.error("[contact] stored but not emailed:", sent.error);
    } else {
      await payload.update({
        collection: "messages",
        id: created.id,
        data: { deliveredByEmail: true },
        overrideAccess: true,
      });
    }

    /**
     * Success either way, and that is not a fudge. The visitor's message is in
     * Postgres and will be read. Telling them it failed because a mail API had
     * a bad minute would make them send it again, or not at all.
     */
    return {
      status: "success",
      message: "Thanks — that has reached me. I answer within a day.",
    };
  } catch (e) {
    console.error("[contact] could not store message:", e);
    return {
      status: "error",
      message:
        "Something broke at my end and I would rather say so than pretend. Please email me directly — the address is just above.",
      values,
    };
  }
}
