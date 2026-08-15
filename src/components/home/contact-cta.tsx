import { Button, Container, Section } from "@/components/ui";
import type { SiteSetting } from "@/payload-types";

export function ContactCta({ settings }: { settings: SiteSetting }) {
  return (
    <Section id="contact">
      <Container>
        <div className="rounded-2xl border border-border bg-surface bg-[radial-gradient(90%_130%_at_50%_0%,var(--accent-soft),transparent_70%)] px-8 py-16 text-center">
          <h2 className="mx-auto mb-4 max-w-[600px] text-[clamp(1.5rem,3.2vw,2rem)]">
            {settings.openToWorkHeading}
          </h2>
          <p className="mx-auto mb-8 max-w-[520px] text-base text-muted">
            {settings.openToWorkBody}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href={`mailto:${settings.email}`}>Get in touch</Button>
            <Button href="/cv" variant="ghost">
              Download CV (PDF)
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
