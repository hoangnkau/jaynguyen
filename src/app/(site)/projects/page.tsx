import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Block, Chip, Page, PageHeader, StatusBadge } from "@/components/ui";
import { getProjects } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Things I've shipped — what's in production, what's still being built, and one I shut down on purpose.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Page>
      <PageHeader
        eyebrow="Projects"
        title="Everything, not just the highlights"
        lead="Each one links to something you can check: a live site, a public repo, or a channel. Including the project I shut down."
      />

      <Block>
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <article
              key={p.id}
              className="flex flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/45"
            >
              <div className="mb-2 flex items-center gap-2.5">
                <h2 className="text-[17px]">{p.title}</h2>
                <StatusBadge status={p.stage} />
              </div>
              <p className="mb-4 flex-1 text-[14.5px] leading-relaxed text-muted">
                {p.summary}
              </p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {(p.tech ?? []).map((t, i) => (
                  <Chip key={i}>{t}</Chip>
                ))}
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                <Link
                  href={p.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13.5px] text-muted underline underline-offset-2 hover:text-fg"
                >
                  Visit ↗
                </Link>
                <Link
                  href={`/projects/${p.slug}`}
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent"
                >
                  Case study
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Block>
    </Page>
  );
}
