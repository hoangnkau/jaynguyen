"use client";

import { useActionState, useId } from "react";
import { submitContactMessage } from "@/app/(site)/contact/actions";
import { CONTACT_INITIAL_STATE, type ContactState } from "@/lib/contact-state";

/**
 * The only interactive component on the public site.
 *
 * WHY IT STILL WORKS WITH JAVASCRIPT OFF
 *
 * `useActionState` is given the server action itself, so React wires the
 * <form> up with a real action attribute and a real POST. Without hydration
 * the browser submits the form the way browsers have always submitted forms,
 * the action runs, and the page comes back. The client component upgrades the
 * experience — inline errors, a pending button, no navigation — rather than
 * being the thing that makes it work at all. On a site arguing for careful
 * engineering, a contact form that is a blank div without JS would be a poor
 * advertisement.
 *
 * A NOTE ON THE FIELD STYLING
 *
 * There is no <Input> in components/ui.tsx and this deliberately does not add
 * one. One form on one page does not justify an abstraction; the day a second
 * form appears is the day the shared component earns its keep.
 */

const field =
  "w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-[15px] text-fg " +
  "placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "aria-[invalid=true]:border-accent";

const label = "mb-1.5 block text-[13.5px] font-medium text-fg";

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-[13px] text-accent">
      {children}
    </p>
  );
}

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<ContactState, FormData>(
    submitContactMessage,
    CONTACT_INITIAL_STATE,
  );

  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    message: `${uid}-message`,
    nameError: `${uid}-name-error`,
    emailError: `${uid}-email-error`,
    messageError: `${uid}-message-error`,
  };

  const errors = state.fieldErrors ?? {};
  const values = state.values;

  /**
   * On success the form is replaced rather than cleared. A visitor who has
   * just typed six sentences should not be looking at an empty box wondering
   * whether it went — the confirmation is the whole response.
   */
  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-xl border border-live/40 bg-live-soft p-6"
      >
        <h3 className="mb-1 text-[17px]">Message sent</h3>
        <p className="text-[14.5px] text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.status === "error" && !Object.keys(errors).length && (
        <p
          role="alert"
          className="rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-[14px] text-fg"
        >
          {state.message}
        </p>
      )}

      <div>
        <label className={label} htmlFor={ids.name}>
          Your name
        </label>
        <input
          id={ids.name}
          name="name"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          defaultValue={values?.name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? ids.nameError : undefined}
          className={field}
        />
        <FieldError id={ids.nameError}>{errors.name}</FieldError>
      </div>

      <div>
        <label className={label} htmlFor={ids.email}>
          Email
        </label>
        <input
          id={ids.email}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          defaultValue={values?.email}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? ids.emailError : undefined}
          className={field}
        />
        <FieldError id={ids.emailError}>{errors.email}</FieldError>
      </div>

      <div>
        <label className={label} htmlFor={ids.message}>
          Message
        </label>
        <textarea
          id={ids.message}
          name="message"
          required
          rows={6}
          minLength={20}
          maxLength={4000}
          defaultValue={values?.message}
          placeholder="A role, a project, or something you're stuck on."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? ids.messageError : undefined}
          className={`${field} resize-y`}
        />
        <FieldError id={ids.messageError}>{errors.message}</FieldError>
      </div>

      {/*
        * Honeypot.
        *
        * Off-screen rather than display:none — a bot that reads computed styles
        * skips hidden fields, and the naive ones that do not are the ones this
        * catches. aria-hidden and tabIndex={-1} keep it away from screen
        * readers and the tab order, so no person can reach it by accident;
        * autoComplete="off" stops a browser helpfully filling it in, which
        * would lock a real visitor out of their own form.
        */}
      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor={`${uid}-company`}>Company (leave this empty)</label>
        <input
          id={`${uid}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-[15px] font-semibold text-on-accent transition-all duration-200 hover:opacity-88 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sending…" : "Send message"}
        </button>
        <p className="text-[13px] text-muted">
          Goes straight to my inbox. No newsletter, no list, nothing shared.
        </p>
      </div>
    </form>
  );
}
