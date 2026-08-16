import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { PagePattern } from "@/components/page-pattern";
import { Block, Chip, Page, PageHeader, StatusBadge } from "@/components/ui";
import { getProjects } from "@/lib/queries";
import type { Project } from "@/payload-types";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Things I've shipped — side projects you can open and check, and the infrastructure work behind them.",
  alternates: { canonical: "/projects" },
};

function ProjectCard({ p }: { p: Project }) {
  const isEngagement = p.kind === "engagement";

  return (
    <article className="flex flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/45">
      <div className="mb-2 flex items-center gap-2.5">
        <h3 className="text-[17px]">{p.title}</h3>
        <StatusBadge status={p.stage} />
      </div>

      {isEngagement && (
        <p className="mb-2 font-mono text-[12px] text-muted">
          {p.client} · {p.period}
          {p.roleHeld ? ` · ${p.roleHeld}` : ""}
        </p>
      )}

      <p className="mb-4 flex-1 text-[14.5px] leading-relaxed text-muted">{p.summary}</p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(p.tech ?? []).map((t, i) => (
          <Chip key={i}>{t}</Chip>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
        {isEngagement ? (
          <span className="text-[13.5px] text-muted">Reference on request</span>
        ) : (
          p.proofUrl && (
            <Link
              href={p.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13.5px] text-muted underline underline-offset-2 hover:text-fg"
            >
              Visit ↗
            </Link>
          )
        )}
        <Link
          href={`/projects/${p.slug}`}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent"
        >
          Case study
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  /**
   * The two groups are kept apart on purpose.
   *
   * Mixing a 2026 web app with a 2012 datacenter build in one grid invites the
   * reader to compare them on the wrong axis, and makes the older work look
   * like filler. Separated and dated, each is judged as what it is: things you
   * can go and click, and things a former client would confirm.
   */
  const side = projects.filter((p) => p.kind !== "engagement");
  const engagements = projects.filter((p) => p.kind === "engagement");

  return (
    <>
      <PagePattern name="contour" />
      <Page>
        <PageHeader
          eyebrow="Projects"
          title="Everything, not just the highlights"
          lead="Side projects link to something you can open and check — including the one I shut down. The engagements below were built for clients and have no public front door, so they are dated, named, and I can put you in touch with someone who was there."
        />

        {!!side.length && (
          <Block title="Side projects">
            <div className="grid gap-6 md:grid-cols-2">
              {side.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </div>
          </Block>
        )}

        {!!engagements.length && (
          <Block title="Client engagements">
            <p className="mb-6 max-w-[var(--container-prose)] text-[14.5px] text-muted">
              Infrastructure work for government and corporate clients in Vietnam. Described
              at the level of the decisions I made — no topology, addressing or device
              detail, because that part belongs to the client and not on a public page.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {engagements.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </div>
          </Block>
        )}
      </Page>
    </>
  );
}
