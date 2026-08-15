import { Chip } from "@/components/ui";
import type { Home } from "@/payload-types";

export function HowIWork({ items }: { items: NonNullable<Home["howIWork"]> }) {
  if (!items.length) return null;

  return (
    <section className="border-y border-border bg-surface" aria-label="How I work">
      <div className="mx-auto grid w-full max-w-[var(--container-content)] sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={item.id ?? i}
            className={`border-b border-border px-6 py-8 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 ${
              i % 2 === 0 ? "sm:border-r sm:border-border" : ""
            } lg:border-b-0 lg:border-r lg:border-border lg:last:border-r-0`}
          >
            <span className="mb-2.5 block font-mono text-[11px] tracking-wider text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mb-2 text-base">{item.title}</h3>
            <p className="mb-3 text-[13.5px] leading-relaxed text-muted">{item.body}</p>
            <div className="flex flex-wrap gap-1.5">
              {(item.chips ?? []).map((chip, j) => (
                <Chip key={j}>{chip}</Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
