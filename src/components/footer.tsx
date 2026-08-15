import Link from "next/link";
import { Container } from "./ui";
import { getSiteSettings } from "@/lib/queries";

export async function Footer() {
  const s = await getSiteSettings();
  const socials = s?.socials ?? [];

  return (
    <footer className="mt-20 border-t border-border py-8">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <span className="text-[13.5px] text-muted">
            © {new Date().getFullYear()} {s?.legalName} · {s?.location} · Built with
            Next.js, hosted on Vercel
          </span>
          <nav className="flex gap-6" aria-label="Elsewhere">
            {socials.map((item) => (
              <Link
                key={item.id ?? item.href}
                href={item.href}
                className="text-[13.5px] text-muted transition-colors hover:text-accent"
                {...(item.href.startsWith("http")
                  ? { target: "_blank", rel: "me noopener noreferrer" }
                  : {})}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
