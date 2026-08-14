"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { blogIsLive, site } from "@/lib/site-config";

export function Nav() {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GUARDRAIL (blueprint §8.2): the Blog link does not render until three
  // posts are published. An empty blog is worse than no blog.
  const links = blogIsLive
    ? [...site.nav.slice(0, 2), { label: "Blog", href: "/blog" }, ...site.nav.slice(2)]
    : site.nav;

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-bg/85 backdrop-blur-md transition-colors ${
        stuck ? "border-border" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[var(--container-content)] items-center gap-6 px-6 py-4">
        <Link href="/" className="-my-1 mr-auto flex items-center gap-2.5 py-3 text-base font-semibold">
          <span className="size-2 shrink-0 rounded-full bg-accent" />
          {site.domain}
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
      </div>
    </header>
  );
}
