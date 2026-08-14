import { Chip } from "@/components/ui";
import { howIWork } from "@/lib/site-config";

export function HowIWork() {
  return (
    <section className="border-y border-border bg-surface" aria-label="How I work">
      <div className="mx-auto grid w-full max-w-[var(--container-content)] sm:grid-cols-2 lg:grid-cols-4">
        {howIWork.map((item, i) => (
          <div
            key={item.n}
            className={`border-b border-border px-6 py-8 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 ${
              i % 2 === 0 ? "sm:border-r sm:border-border" : ""
            } lg:border-b-0 lg:border-r lg:border-border lg:last:border-r-0`}
          >
            <span className="mb-2.5 block font-mono text-[11px] tracking-wider text-accent">
              {item.n}
            </span>
            <h3 className="mb-2 text-base">{item.title}</h3>
            <p className="mb-3 text-[13.5px] leading-relaxed text-muted">{item.body}</p>
            <div className="flex flex-wrap gap-1.5">
              {item.chips.map((chip) => (
                <Chip key={chip}>{chip}</Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
