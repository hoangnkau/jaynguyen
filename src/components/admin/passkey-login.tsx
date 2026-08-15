"use client";

import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";

/**
 * Rendered under Payload's login form. Password login stays available
 * deliberately — see the note in Users.ts.
 */
export function PasskeyLogin() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  async function signIn() {
    setError(null);
    setBusy(true);
    try {
      const optionsRes = await fetch("/auth/passkey/login/options", { method: "POST" });
      if (!optionsRes.ok) throw new Error("Could not start sign-in");
      const options = await optionsRes.json();

      const credential = await startAuthentication({ optionsJSON: options });

      const verifyRes = await fetch("/auth/passkey/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const result = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(result.error ?? "Sign-in failed");

      /**
       * A full page load, not router.push, on purpose: the session cookie was
       * just set server-side and every Payload admin screen is rendered from
       * it. A client-side navigation would keep the pre-auth React tree.
       */
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/admin";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function useRecoveryCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/auth/passkey/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Recovery failed");
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/admin/account";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recovery failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--theme-elevation-150)" }}>
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className="btn btn--style-secondary"
        style={{ width: "100%", margin: 0 }}
      >
        {busy ? "Waiting for your device…" : "Sign in with a passkey"}
      </button>

      {error && (
        <p style={{ marginTop: 12, color: "var(--theme-error-500)", fontSize: 13 }}>{error}</p>
      )}

      <p style={{ marginTop: 16, fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>
        Your device will ask for a fingerprint, face or PIN. The key never leaves
        the device, and it only works on this domain.
      </p>

      {!recovery ? (
        <button
          type="button"
          onClick={() => setRecovery(true)}
          style={{
            marginTop: 8, background: "none", border: 0, padding: 0,
            font: "inherit", fontSize: 12, opacity: 0.7,
            textDecoration: "underline", cursor: "pointer",
          }}
        >
          Lost every device? Use a recovery code
        </button>
      ) : (
        <form onSubmit={useRecoveryCode} style={{ marginTop: 16 }}>
          <input
            type="email" required placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-type text" style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            type="text" required placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" value={code}
            onChange={(e) => setCode(e.target.value)}
            className="field-type text" style={{ width: "100%", marginBottom: 8, fontFamily: "monospace" }}
          />
          <button type="submit" disabled={busy} className="btn btn--style-secondary" style={{ width: "100%", margin: 0 }}>
            Sign in with recovery code
          </button>
          <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            The code works once. Register a new passkey straight after — that
            issues a fresh one.
          </p>
        </form>
      )}
    </div>
  );
}
