import type { Metadata } from "next";
import Link from "next/link";
import { Block, Page, PageHeader } from "@/components/ui";
import { getAbout, getCV, getSiteSettings } from "@/lib/queries";
import { PagePattern } from "@/components/page-pattern";

export const metadata: Metadata = {
  title: "CV",
  description: "Curriculum vitae — Khanh Hoang (Jay) Nguyen, Darwin NT.",
  alternates: { canonical: "/cv" },
};

export default async function CVPage() {
  const [cv, about, s] = await Promise.all([
    getCV(),
    getAbout(),
    getSiteSettings(),
  ]);
  const file = typeof cv.file === "object" && cv.file !== null ? cv.file : null;

  return (
    <>
      <PagePattern name="dots" />
      <Page>
        <div className="flex flex-wrap items-end justify-between gap-4 print:block">
          <PageHeader
            eyebrow="Curriculum vitae"
            title={s.legalName}
            lead={`${s.location} · ${s.email}`}
          />
          {file?.url && (
            <Link
              href={file.url}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent print:hidden"
            >
              Download PDF
            </Link>
          )}
        </div>

        {/*
          The headline and summary were defined in globals/CV.ts, with a note
          explaining that a bare reverse-chronological list makes the reader
          assemble the argument themselves. They were then never rendered, so
          the page kept doing exactly what the note warned against. Fields the
          CMS collects and the page ignores are worse than absent fields: the
          admin says the work is done.
        */}
        {cv.headline && (
          <p className="mt-6 max-w-[var(--container-prose)] text-[17.5px] font-medium leading-snug">
            {cv.headline}
          </p>
        )}
        {cv.summary && (
          <p className="mt-4 max-w-[var(--container-prose)] text-[15.5px] leading-relaxed text-muted">
            {cv.summary}
          </p>
        )}

        {!!about.timeline?.length && (
          <Block title="Experience">
            <ol className="border-t border-border">
              {about.timeline.map((row, i) => (
                <li
                  key={row.id ?? i}
                  className="grid gap-1 border-b border-border py-5 sm:grid-cols-[190px_1fr]"
                >
                  <span className="font-mono text-[13px] text-muted">
                    {row.period}
                  </span>
                  <div>
                    <h3 className="text-[16px]">{row.role}</h3>
                    <p className="text-[14.5px] text-muted">
                      {row.organisation}
                    </p>

                    {/*
                      What was actually achieved, not just where and when.

                      /about rendered these and /cv did not, which is the wrong
                      way round: /about is a story a reader chooses to follow,
                      /cv is the document a recruiter skims for evidence. A
                      list of job titles with no outcomes under them is a
                      record of attendance.

                      Empty rows simply do not render, so a role with nothing
                      written yet stays clean rather than showing a stub.
                    */}
                    {!!row.bullets?.length && (
                      <ul className="mt-2.5 flex flex-col gap-1.5">
                        {row.bullets.map((b, j) => (
                          <li
                            key={b.id ?? j}
                            className="flex gap-2.5 text-[14.5px] leading-snug text-muted"
                          >
                            <span
                              aria-hidden
                              className="mt-[9px] size-1 shrink-0 rounded-full bg-accent"
                            />
                            <span>{b.text}</span>
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
          <Block title="Education & certifications">
            <ul className="flex flex-col gap-3">
              {about.credentials.map((c, i) => (
                <li key={c.id ?? i} className="text-[15px]">
                  <span className="font-medium">{c.award}</span>
                  <span className="text-muted">
                    {" "}
                    — {c.institution}, {c.year}
                    {c.inProgress ? " (in progress)" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {!!about.skillGroups?.length && (
          <Block title="Skills">
            <dl className="flex flex-col gap-4">
              {about.skillGroups.map((g, i) => (
                <div
                  key={g.id ?? i}
                  className="grid gap-1 sm:grid-cols-[190px_1fr]"
                >
                  <dt className="font-mono text-[12px] uppercase tracking-wider text-accent">
                    {g.group}
                  </dt>
                  <dd className="text-[14.5px] text-muted">
                    {(g.skills ?? []).join(" · ")}
                  </dd>
                </div>
              ))}
            </dl>
          </Block>
        )}

        {/* GUARDRAIL (blueprint §8.2): referee names and phone numbers never
            appear on a public page. The CMS has no field for them. */}
        <p className="mt-16 border-t border-border pt-6 text-[14.5px] text-muted">
          {cv.referencesNote ?? "References available on request."}
          {cv.lastUpdated && (
            <span className="ml-2 font-mono text-[12.5px]">
              Last updated{" "}
              {new Date(cv.lastUpdated).toLocaleDateString("en-AU", {
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </p>
      </Page>
    </>
  );
}
