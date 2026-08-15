import type { Metadata } from "next";
import Link from "next/link";
import { Block, Button, Page, PageHeader } from "@/components/ui";
import { getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about a role, a project, or something you're stuck on.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const s = await getSiteSettings();

  return (
    <Page>
      <PageHeader
        eyebrow="Contact"
        title={s.openToWorkHeading}
        lead={s.openToWorkBody}
      />

      <Block>
        <div className="max-w-[var(--container-prose)] rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-1 text-[17px]">Email</h2>
          <p className="mb-4 text-[14.5px] text-muted">
            The fastest way to reach me. I answer within a day.
          </p>
          <Link
            href={`mailto:${s.email}`}
            className="font-mono text-[15px] text-accent underline underline-offset-4"
          >
            {s.email}
          </Link>
        </div>

        {!!s.socials?.length && (
          <div className="mt-4 max-w-[var(--container-prose)] rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-[17px]">Elsewhere</h2>
            <ul className="flex flex-wrap gap-5">
              {s.socials
                .filter((x) => x.href?.startsWith("http"))
                .map((x) => (
                  <li key={x.id ?? x.href}>
                    <Link
                      href={x.href}
                      target="_blank"
                      rel="me noopener noreferrer"
                      className="text-[14.5px] text-muted underline underline-offset-4 hover:text-fg"
                    >
                      {x.label} ↗
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <Button href="/cv" variant="ghost">
            Or download my CV
          </Button>
        </div>

        {/* A contact form with spam protection lands in Phase 7. Until then the
            email address is the honest option — a form that silently fails is
            worse than no form. */}
      </Block>
    </Page>
  );
}
