import Link from "next/link";
import { Container } from "./ui";
import { site } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border py-8">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <span className="text-[13.5px] text-muted">
            © {new Date().getFullYear()} {site.legalName} · {site.location} · Built with
            Next.js, hosted on Vercel
          </span>
          <nav className="flex gap-6" aria-label="Elsewhere">
            {site.socials.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="text-[13.5px] text-muted transition-colors hover:text-accent"
                {...(s.href.startsWith("http")
                  ? { target: "_blank", rel: "me noopener noreferrer" }
                  : {})}
              >
                {s.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
