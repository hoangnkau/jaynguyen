import type { Metadata } from "next";
import Link from "next/link";
import { Block, Page, PageHeader } from "@/components/ui";
import { getAbout, getCV, getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "CV",
  description: "Curriculum vitae — Khanh Hoang (Jay) Nguyen, Darwin NT.",
  alternates: { canonical: "/cv" },
};

export default async function CVPage() {
  const [cv, about, s] = await Promise.all([getCV(), getAbout(), getSiteSettings()]);
  const file = typeof cv.file === "object" && cv.file !== null ? cv.file : null;

  return (
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

      {!!about.timeline?.length && (
        <Block title="Experience">
          <ol className="border-t border-border">
              {about.timeline.map((row, i) => (
                <li
                  key={row.id ?? i}
                  className="grid gap-1 border-b border-border py-5 sm:grid-cols-[190px_1fr]"
                >
                  <span className="font-mono text-[13px] text-muted">{row.period}</span>
                  <div>
                    <h3 className="text-[16px]">{row.role}</h3>
                    <p className="text-[14.5px] text-muted">{row.organisation}</p>
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
                <div key={g.id ?? i} className="grid gap-1 sm:grid-cols-[190px_1fr]">
                  <dt className="font-mono text-[12px] uppercase tracking-wider text-accent">
                    {g.group}
                  </dt>
                  <dd className="text-[14.5px] text-muted">{(g.skills ?? []).join(" · ")}</dd>
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
              Last updated {new Date(cv.lastUpdated).toLocaleDateString("en-AU", {
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
      </p>
    </Page>
  );
}
