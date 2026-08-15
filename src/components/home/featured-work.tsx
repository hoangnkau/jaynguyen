import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import {
  Button, Chip, Container, Eyebrow, Lead, Section, SectionTitle, StatusBadge,
} from "@/components/ui";
import type { Home, Project } from "@/payload-types";

export function FeaturedWork({
  home,
  projects,
  totalCount,
}: {
  home: Home;
  projects: Project[];
  totalCount: number;
}) {
  /**
   * GUARDRAIL (blueprint §8.1): no card without proof — but proof takes two
   * forms. A side project proves itself with a link; an engagement proves
   * itself with a named client and a date range. A card missing whichever
   * applies to it does not render.
   */
  const featured = projects.filter((p) =>
    p.featured && (p.kind === "engagement" ? Boolean(p.client && p.period) : Boolean(p.proofUrl)),
  );
  if (!featured.length) return null;

  return (
    <Section id="work">
      <Container>
        <Eyebrow>Selected work</Eyebrow>
        <SectionTitle>{home.workTitle}</SectionTitle>
        <Lead>{home.workLead}</Lead>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {featured.map((project) => (
            <article
              key={project.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/45"
            >
              <div className="relative grid h-[170px] place-items-center border-b border-border bg-surface-2 text-xs text-muted">
                <span>screenshot 16:10</span>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,var(--accent-soft),transparent_65%)]" />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex items-center gap-2.5">
                  <h3 className="text-[17px]">{project.title}</h3>
                  <StatusBadge status={project.stage} />
                </div>

                {project.kind === "engagement" && (
                  <p className="mb-2 font-mono text-[12px] text-muted">
                    {project.client} · {project.period}
                  </p>
                )}

                <p className="mb-4 flex-1 text-[14.5px] leading-relaxed text-muted">
                  {project.summary}
                </p>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {(project.tech ?? []).map((t, i) => (
                      <Chip key={i}>{t}</Chip>
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

        {totalCount > featured.length && (
          <div className="mt-8 text-center">
            <Button href="/projects" variant="ghost">
              See all {totalCount} projects
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </Container>
    </Section>
  );
}
