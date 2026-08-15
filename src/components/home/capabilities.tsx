import { capabilityIcons } from "@/components/icons";
import { Chip, Container, Eyebrow, Lead, Section, SectionTitle } from "@/components/ui";
import type { Home } from "@/payload-types";

export function Capabilities({ home }: { home: Home }) {
  /**
   * GUARDRAIL (blueprint §8.1): a capability only renders if the project it
   * cites is present and published. The CMS already refuses to save one
   * without an evidence link; this is the second gate, for the case where the
   * cited project is later unpublished or deleted. A claim whose evidence has
   * gone away stops being shown.
   */
  const shown = (home.capabilities ?? []).filter(
    (c) => typeof c.evidence === "object" && c.evidence !== null,
  );

  if (!shown.length) return null;

  return (
    <Section id="about">
      <Container>
        <Eyebrow>{home.capabilitiesEyebrow ?? "What I do"}</Eyebrow>
        <SectionTitle>{home.capabilitiesTitle}</SectionTitle>
        <Lead>{home.capabilitiesLead}</Lead>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {shown.map((cap, i) => {
            const Icon = capabilityIcons[cap.icon];
            return (
              <article
                key={cap.id ?? i}
                className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/45"
              >
                <div className="mb-4 grid size-10 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="size-5" />
                </div>
                <h3 className="mb-2 text-[17.5px]">{cap.title}</h3>
                <p className="mb-4 text-[14.5px] leading-relaxed text-muted">{cap.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(cap.chips ?? []).map((chip, j) => (
                    <Chip key={j}>{chip}</Chip>
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
