import { collectHealthRows } from "@/lib/health";

/**
 * The admin health panel (blueprint §8.3) — presentation only.
 *
 * The blueprint converts every warning it makes into something that enforces
 * itself, because a list of warnings is useless: in eight months nobody
 * rereads it. Most of those became required fields or access rules. A handful
 * could not, because they go bad over TIME rather than at the moment of
 * saving — a backup gets old, a project gets unpublished and orphans a claim
 * that cites it, the CV drifts out of step with the site.
 *
 * Nothing can catch those at write time, so they were left as "remember to
 * check", which is the failure §8.3 exists to prevent. This panel is the
 * answer: the checks run on every visit to the dashboard, so noticing costs
 * ten seconds of looking rather than an act of memory.
 *
 * The checks themselves are in src/lib/health.ts — see the note there on why
 * they cannot live inside a component.
 */
export async function HealthPanel() {
  const rows = await collectHealthRows();
  const failing = rows.filter((r) => !r.ok);
  const criticalFailing = failing.filter((r) => r.critical);

  return (
    <section
      style={{
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: 8,
        padding: "1.25rem 1.5rem",
        marginBottom: "2rem",
      }}
    >
      <header style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Site health</h2>
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", opacity: 0.7 }}>
          {failing.length === 0
            ? "All checks passing."
            : `${failing.length} need attention${
                criticalFailing.length ? `, ${criticalFailing.length} of them urgent` : ""
              }.`}{" "}
          These are the guardrails that go stale over time rather than at save time
          (blueprint §8.3).
        </p>
      </header>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {rows.map((r) => (
          <li
            key={r.label}
            style={{
              display: "grid",
              gridTemplateColumns: "10px 220px 1fr",
              gap: "0.75rem",
              alignItems: "baseline",
              padding: "0.5rem 0",
              borderTop: "1px solid var(--theme-elevation-100)",
              fontSize: "0.85rem",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: r.ok ? "#3fb950" : r.critical ? "#e5484d" : "#e0a12a",
                display: "inline-block",
              }}
            />
            <span style={{ fontWeight: 600 }}>
              {r.label}
              <span style={{ position: "absolute", left: -9999 }}>
                {r.ok ? " — passing" : r.critical ? " — urgent" : " — attention"}
              </span>
            </span>
            <span style={{ opacity: r.ok ? 0.65 : 1 }}>{r.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
