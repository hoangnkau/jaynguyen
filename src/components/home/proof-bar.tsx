import type { Home } from "@/payload-types";

export function ProofBar({ stats }: { stats: NonNullable<Home["stats"]> }) {
  if (!stats.length) return null;

  return (
    <section className="border-y border-border bg-surface" aria-label="At a glance">
      <div className="mx-auto grid w-full max-w-[var(--container-content)] grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.id ?? i}
            className={`px-6 py-8 ${
              i < stats.length - 1 ? "lg:border-r lg:border-border" : ""
            } ${i % 2 === 0 ? "border-r border-border lg:border-r" : ""} ${
              i < 2 ? "border-b border-border lg:border-b-0" : ""
            }`}
          >
            {/* `justification` is deliberately not rendered — see blueprint §8.1. */}
            <span className="mb-0.5 block text-3xl font-bold tracking-[-0.03em]">
              {stat.value}
            </span>
            <span className="text-[13px] leading-snug text-muted">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
