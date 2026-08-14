import { Container, RichLine, Section } from "@/components/ui";
import { currently } from "@/lib/site-config";

export function Currently() {
  return (
    <Section tight>
      <Container>
        <div className="rounded-xl border border-border bg-surface p-8">
          <div className="grid gap-8 lg:grid-cols-[180px_1fr]">
            <div>
              <h2 className="mb-1.5 text-[22px]">Currently</h2>
              <span className="font-mono text-xs text-muted">
                Updated {currently.updated}
              </span>
            </div>

            <ul className="flex flex-col gap-3.5">
              {currently.items.map((item) => (
                <li key={item} className="flex gap-3 text-[15.5px] leading-relaxed text-muted">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    <RichLine text={item} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
