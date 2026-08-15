import type { Metadata } from "next";
import Link from "next/link";
import { RichText } from "@/components/rich-text";
import { Block, Page, PageHeader } from "@/components/ui";
import { getAbout, getSiteSettings } from "@/lib/queries";
import type { Project } from "@/payload-types";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: "About",
    description: s?.seoDescription ?? undefined,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const about = await getAbout();

  /**
   * GUARDRAIL (blueprint §8.1), second gate — the same rule the home page
   * capabilities use.
   *
   * The CMS refuses to save a skill group without an evidence project. This
   * covers the other direction: a project that was published when the group
   * was written, and has since been unpublished or deleted. Because the read
   * runs with overrideAccess: false, an evidence project the public cannot see
   * comes back as a bare ID rather than an object — so an unproven group stops
   * rendering rather than standing there as an unsupported claim.
   */
  const shownSkillGroups = (about.skillGroups ?? []).filter(
    (g) => typeof g.evidence === "object" && g.evidence !== null,
  );

  return (
    <Page>
      <PageHeader
        eyebrow="About"
        title="Technician, business owner, accountant, now security"
      />

      <Block>
        <RichText data={about.bio} className="text-[17px] leading-[1.75] text-muted" />
      </Block>

      {!!about.timeline?.length && (
        <Block title="Timeline">
          <ol className="border-t border-border">
            {about.timeline.map((row, i) => (
              <li
                key={row.id ?? i}
                className="grid gap-2 border-b border-border py-6 sm:grid-cols-[190px_1fr]"
              >
                <span className="font-mono text-[13px] text-muted">{row.period}</span>
                <div>
                  <h3 className="text-[16.5px]">{row.role}</h3>
                  <p className="mt-0.5 text-[14.5px] text-muted">{row.organisation}</p>
                  {!!row.bullets?.length && (
                    <ul className="mt-3 flex flex-col gap-1.5">
                      {row.bullets.map((b, j) => (
                        <li key={b.id ?? j} className="flex gap-2.5 text-[14.5px] text-muted">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                          {b.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Block>
      )}

      {!!about.credentials?.length && (
        <Block title="Credentials">
          <ul className="grid gap-4 sm:grid-cols-2">
            {about.credentials.map((c, i) => (
              <li key={c.id ?? i} className="rounded-xl border border-border bg-surface p-5">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-[16px]">{c.award}</h3>
                  {c.inProgress && (
                    <span className="rounded bg-accent-soft px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-accent">
                      In progress
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-muted">
                  {c.institution} · {c.year}
                </p>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {!!shownSkillGroups.length && (
        <Block title="Skills">
          <p className="mb-8 max-w-[var(--container-prose)] text-[14.5px] text-muted">
            Each group names the project it is demonstrated by. If I can&rsquo;t point at
            something you can go and look at, it isn&rsquo;t on this list.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {shownSkillGroups.map((g, i) => {
              const proof = g.evidence as Project;
              return (
                <div key={g.id ?? i}>
                  <h3 className="mb-3 font-mono text-[12px] uppercase tracking-wider text-accent">
                    {g.group}
                  </h3>
                  <ul className="flex flex-col gap-1.5">
                    {(g.skills ?? []).map((s, j) => (
                      <li key={j} className="text-[14.5px] text-muted">
                        {s}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/projects/${proof.slug}`}
                    className="mt-3 inline-block border-t border-border pt-2.5 text-[13px] text-muted transition-colors hover:text-accent"
                  >
                    Demonstrated in <span className="text-fg">{proof.title}</span> &rarr;
                  </Link>
                </div>
              );
            })}
          </div>
        </Block>
      )}

      {about.beyondWork && (
        <Block title="Beyond work">
          <p className="max-w-[var(--container-prose)] text-muted">{about.beyondWork}</p>
        </Block>
      )}
    </Page>
  );
}
