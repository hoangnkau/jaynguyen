import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/rich-text";
import { Block, Chip, Page, StatusBadge } from "@/components/ui";
import { getProject, getProjects } from "@/lib/queries";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/projects/${p.slug}` },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const p = await getProject(slug);

  // A draft, or a third-party project without consent, is not readable here —
  // getProject runs with overrideAccess:false, so this is a real 404.
  if (!p) notFound();

  const blocks = [
    { title: "The problem", data: p.problem },
    { title: "What I built", data: p.built },
    { title: "How it works", data: p.howItWorks },
    { title: "What I learned", data: p.learned },
  ].filter((b) => b.data);

  return (
    <Page>
      <Link
        href="/projects"
        className="mb-8 inline-block text-[13.5px] text-muted hover:text-fg"
      >
        ← All projects
      </Link>

        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h1 className="text-[clamp(1.8rem,4vw,2.6rem)]">{p.title}</h1>
          <StatusBadge status={p.stage} />
        </div>

        <p className="max-w-[var(--container-prose)] text-[17px] text-muted">{p.summary}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {(p.tech ?? []).map((t, i) => (
            <Chip key={i}>{t}</Chip>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 border-y border-border py-4 text-[14px]">
          <Link
            href={p.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent"
          >
            Visit the project ↗
          </Link>
          {p.repoUrl && (
            <Link
              href={p.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-fg"
            >
              Source ↗
            </Link>
          )}
        </div>

      {blocks.length ? (
        blocks.map((b) => (
          <Block key={b.title} title={b.title}>
            <RichText data={b.data} className="text-muted" />
          </Block>
        ))
      ) : (
        <Block>
          <p className="text-muted">The write-up for this one is still to come.</p>
        </Block>
      )}
    </Page>
  );
}
