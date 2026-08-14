import { capabilityIcons } from "@/components/icons";
import { Chip, Container, Eyebrow, Lead, Section, SectionTitle } from "@/components/ui";
import { capabilities, projects } from "@/lib/site-config";

export function Capabilities() {
  // GUARDRAIL (blueprint §8.1): a capability only renders if the project it
  // cites actually exists. A claim with no evidence never reaches the page.
  const slugs = new Set(projects.map((p) => p.slug));
  const shown = capabilities.filter((c) => slugs.has(c.evidence));

  return (
    <Section id="about">
      <Container>
        <Eyebrow>What I do</Eyebrow>
        <SectionTitle>Four layers of the same stack</SectionTitle>
        <Lead>
          Most people pick one end — the hardware, the network, the security model, or the
          ledger. Twenty years of the first two, a Master&apos;s in the third and a degree in
          the fourth means I can hold the whole conversation.
        </Lead>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {shown.map((cap) => {
            const Icon = capabilityIcons[cap.icon];
            return (
              <article
                key={cap.title}
                className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/45"
              >
                <div className="mb-4 grid size-10 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="size-5" />
                </div>
                <h3 className="mb-2 text-[17.5px]">{cap.title}</h3>
                <p className="mb-4 text-[14.5px] leading-relaxed text-muted">{cap.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cap.chips.map((chip) => (
                    <Chip key={chip}>{chip}</Chip>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
