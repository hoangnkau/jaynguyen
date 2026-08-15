"use client";

import { useCallback, useEffect, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";

type Passkey = { id: number; deviceName: string; lastUsedAt?: string | null; createdAt: string };

export function PasskeyManage() {
  const [keys, setKeys] = useState<Passkey[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  const fetchKeys = useCallback(async (): Promise<Passkey[]> => {
    try {
      const res = await fetch("/api/passkeys?limit=50&depth=0", { credentials: "include" });
      if (!res.ok) return [];
      const data = await res.json();
      return data.docs ?? [];
    } catch {
      return [];
    }
  }, []);

  const load = useCallback(async () => setKeys(await fetchKeys()), [fetchKeys]);

  useEffect(() => {
    // State is set inside the async callback, not synchronously in the effect
    // body, and the cancelled flag stops a late response updating an unmounted
    // component.
    let cancelled = false;
    void (async () => {
      const docs = await fetchKeys();
      if (!cancelled) setKeys(docs);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchKeys]);

  async function register() {
    setError(null);
    setBusy(true);
    try {
      const deviceName =
        window.prompt("Name this authenticator (e.g. 'Phone', 'YubiKey', 'Laptop')") ?? "";
      if (!deviceName.trim()) return;

      const optionsRes = await fetch("/auth/passkey/register/options", { method: "POST" });
      if (!optionsRes.ok) throw new Error("Could not start registration");
      const options = await optionsRes.json();

      const credential = await startRegistration({ optionsJSON: options });

      const verifyRes = await fetch("/auth/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, deviceName: deviceName.trim() }),
      });
      const result = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(result.error ?? "Registration failed");

      if (result.recoveryCode) setRecoveryCode(result.recoveryCode);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  async function rotateRecovery() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/auth/passkey/recovery/rotate", { method: "POST" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Could not generate a code");
      setRecoveryCode(result.recoveryCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate a code");
    } finally {
      setBusy(false);
    }
  }

  const count = keys?.length ?? 0;

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ marginBottom: 4 }}>Passkeys</h3>
      <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 12, lineHeight: 1.5 }}>
        Sign in with a fingerprint, face, PIN or hardware key instead of a password.
      </p>

      {recoveryCode && (
        <div
          style={{
            border: "2px solid var(--theme-warning-500)", borderRadius: 6,
            padding: 16, marginBottom: 16,
          }}
        >
          <strong style={{ display: "block", marginBottom: 8 }}>
            Recovery code — shown once, right now
          </strong>
          <code style={{ display: "block", fontSize: 18, letterSpacing: 1, marginBottom: 8 }}>
            {recoveryCode}
          </code>
          <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            Write it on paper or put it in a password manager under a different
            account. If you lose every authenticator, this is the only way back
            in — it is stored here only as a hash and cannot be shown again.
          </p>
        </div>
      )}

      {count === 1 && (
        <div
          style={{
            border: "1px solid var(--theme-warning-500)", borderRadius: 6,
            padding: 12, marginBottom: 16, fontSize: 13, lineHeight: 1.5,
          }}
        >
          <strong>Register a second authenticator.</strong> With only one, a lost
          or wiped device means a lockout. Add your phone as well as this
          computer, then sign out and sign back in with the second one to prove
          it works.
        </div>
      )}

      {keys === null ? (
        <p style={{ fontSize: 13, opacity: 0.6 }}>Loading…</p>
      ) : count === 0 ? (
        <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 12 }}>
          None registered yet. You are signing in with a password.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px" }}>
          {keys.map((k) => (
            <li
              key={k.id}
              style={{
                display: "flex", justifyContent: "space-between", gap: 12,
                padding: "8px 0", borderBottom: "1px solid var(--theme-elevation-100)",
                fontSize: 13,
              }}
            >
              <span>{k.deviceName}</span>
              <span style={{ opacity: 0.6 }}>
                {k.lastUsedAt
                  ? `last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                  : "never used"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={register} disabled={busy} className="btn btn--style-secondary" style={{ margin: 0 }}>
          {busy ? "Waiting for your device…" : "Register a passkey"}
        </button>
        <button type="button" onClick={rotateRecovery} disabled={busy} className="btn btn--style-secondary" style={{ margin: 0 }}>
          New recovery code
        </button>
      </div>

      <p style={{ marginTop: 10, fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>
        A passkey only works on the hostname it was created for. Ones registered
        on localhost will not work on the live domain — register the real ones
        after the domain is attached, then generate a new recovery code.
      </p>

      {error && (
        <p style={{ marginTop: 10, color: "var(--theme-error-500)", fontSize: 13 }}>{error}</p>
      )}
    </div>
  );
}
