import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import {
  Button,
  Chip,
  Container,
  Eyebrow,
  Lead,
  Section,
  SectionTitle,
  StatusBadge,
} from "@/components/ui";
import { projects } from "@/lib/site-config";

export function FeaturedWork() {
  // GUARDRAIL (blueprint §8.1): no card without proof.
  const featured = projects.filter((p) => p.featured && p.proofUrl);
  const total = projects.filter((p) => p.proofUrl).length;

  return (
    <Section id="work">
      <Container>
        <Eyebrow>Selected work</Eyebrow>
        <SectionTitle>Things I&apos;ve actually shipped</SectionTitle>
        <Lead>
          Honestly labelled: what&apos;s in production, what&apos;s still being built, and one
          I shut down on purpose.
        </Lead>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {featured.map((project) => (
            <article
              key={project.slug}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/45"
            >
              <div className="relative grid h-[170px] place-items-center border-b border-border bg-surface-2 text-xs text-muted">
                <span>screenshot 16:10</span>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,var(--accent-soft),transparent_65%)]" />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex items-center gap-2.5">
                  <h3 className="text-[17px]">{project.title}</h3>
                  <StatusBadge status={project.status} />
                </div>

                <p className="mb-4 flex-1 text-[14.5px] leading-relaxed text-muted">
                  {project.summary}
                </p>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <Chip key={t}>{t}</Chip>
                    ))}
                  </div>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex shrink-0 items-center gap-1.5 text-[13.5px] font-semibold text-accent"
                  >
                    Case study
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {total > featured.length && (
          <div className="mt-8 text-center">
            <Button href="/projects" variant="ghost">
              See all {total} projects
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </Container>
    </Section>
  );
}
