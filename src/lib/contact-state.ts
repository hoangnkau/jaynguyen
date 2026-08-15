/**
 * The shape passed between the contact form and its server action.
 *
 * WHY THIS IS NOT IN actions.ts, WHERE IT BELONGS
 *
 * A file marked `"use server"` may only export async functions. Every export
 * in such a file becomes a callable server endpoint, so a plain constant
 * sitting beside the action is not a stylistic wrinkle — it is a build error,
 * and one that fires at `next build` rather than in the editor.
 *
 * The initial state has to be shared: the action's signature is
 * (previousState, formData), and the component needs the same value to seed
 * useActionState. So it lives here, in an ordinary module both sides may
 * import. The type could technically have stayed in actions.ts, since types
 * are erased before that check runs — but splitting a type from the constant
 * that instantiates it, purely because one of them happens to survive
 * compilation, is the kind of arrangement nobody remembers the reason for.
 */

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
  /** Echoed back so a rejected submission does not wipe what was typed. */
  values?: { name: string; email: string; message: string };
};

export const CONTACT_INITIAL_STATE: ContactState = { status: "idle", message: "" };
