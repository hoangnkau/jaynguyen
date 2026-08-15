import Link from "next/link";
import { NavShell } from "./nav-shell";
import { ThemeToggle } from "./theme-toggle";
import { blogIsLive, getSiteSettings } from "@/lib/queries";

export async function Nav() {
  const [settings, showBlog] = await Promise.all([getSiteSettings(), blogIsLive()]);

  // GUARDRAIL (blueprint §8.2): the Blog link does not render until three
  // posts are published. An empty blog is worse than no blog.
  const links = [
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    ...(showBlog ? [{ label: "Blog", href: "/blog" }] : []),
    { label: "Contact", href: "/contact" },
  ];

  return (
    <NavShell>
      <Link
        href="/"
        className="-my-1 mr-auto flex items-center gap-2.5 py-3 text-base font-semibold"
      >
        <span className="size-2 shrink-0 rounded-full bg-accent" />
        {/*
          * The display name, not the domain and not the legal name.
          *
          * The domain is redundant — the visitor is already on it — and it
          * spends the most-looked-at slot on the page saying nothing they
          * don't know. The full legal name is 26 characters and crowds the
          * nav on a phone; "(Jay)" also reads as a form field rather than a
          * wordmark. The legal name still appears where it carries weight:
          * the footer, the CV heading, and the JSON-LD Person schema.
          */}
        {settings?.name ?? "Jay Nguyen"}
      </Link>

      <nav className="flex items-center gap-6" aria-label="Main">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hidden py-3 text-[14.5px] font-medium text-muted transition-colors hover:text-fg sm:block"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/cv"
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-88"
        >
          Download CV
        </Link>
        <ThemeToggle />
      </nav>
    </NavShell>
  );
}
