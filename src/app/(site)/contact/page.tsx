import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
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
        <div className="max-w-[var(--container-prose)] rounded-xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="mb-1 text-[17px]">Send me a message</h2>
          <p className="mb-6 text-[14.5px] text-muted">
            Three fields, and it reaches me the same way an email does.
          </p>
          <ContactForm />
        </div>

        {/*
          * The address stays, below the form rather than instead of it.
          *
          * Some people will not type into a form on a stranger's site, and
          * they are not wrong to be wary. Others want a thread in their own
          * sent items. Removing the address to push everyone through the form
          * would cost more contacts than the form gains.
          */}
        <div className="mt-4 max-w-[var(--container-prose)] rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-1 text-[17px]">Or just email me</h2>
          <p className="mb-4 text-[14.5px] text-muted">
            Same inbox, no form in between. I answer within a day.
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
      </Block>
    </Page>
  );
}
