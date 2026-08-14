import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[var(--container-content)] px-6 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  children,
  id,
  tight = false,
}: {
  children: ReactNode;
  id?: string;
  tight?: boolean;
}) {
  return (
    <section id={id} className={tight ? "py-16 sm:py-20" : "py-20 sm:py-28"}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.14em] text-accent">
      {children}
    </span>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-[clamp(1.6rem,3.4vw,2.1rem)]">{children}</h2>;
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[var(--container-prose)] text-muted">{children}</p>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-border bg-surface-2 px-2.5 py-0.5 font-mono text-[11.5px] text-muted">
      {children}
    </span>
  );
}

type ButtonProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "ghost";
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-accent text-on-accent hover:opacity-88 hover:-translate-y-px"
      : "border border-border text-fg hover:border-fg hover:bg-surface";

  return (
    <Link
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[15px] font-semibold transition-all duration-200 ${styles} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

const badgeStyles = {
  live: "bg-live-soft text-live",
  building: "bg-accent-soft text-accent",
  archived: "border border-border bg-surface-2 text-muted",
} as const;

const badgeLabels = {
  live: "Live",
  building: "In build",
  archived: "Archived",
} as const;

export function StatusBadge({ status }: { status: keyof typeof badgeStyles }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${badgeStyles[status]}`}
    >
      {badgeLabels[status]}
    </span>
  );
}

/** Renders **bold** segments without pulling in a markdown parser. */
export function RichLine({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-fg">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}
