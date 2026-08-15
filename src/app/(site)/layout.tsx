import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getSiteSettings } from "@/lib/queries";
import { resolveServerUrl } from "@/lib/server-url";
import "../globals.css";

/**
 * This is a ROOT layout — it renders <html> and <body>.
 *
 * The app has two root layouts, one per route group: this one for the public
 * site, and (payload)/layout.tsx for the admin. Payload ships its own <html>
 * wrapper, so a shared root layout above both would nest <html> inside <html>
 * and break the admin. Next.js supports multiple root layouts precisely for
 * this case — there is deliberately no src/app/layout.tsx.
 */

/**
 * Fonts are self-hosted rather than pulled from Google.
 * Three reasons, all of which matter for this site:
 *   1. No third-party request on page load — faster LCP, one less DNS lookup.
 *   2. No visitor IP handed to Google — the privacy-correct default, and the
 *      one a security-focused portfolio should be seen to make.
 *   3. The build does not depend on an external service being reachable.
 * Variable fonts, latin subset only: 48 KB + 40 KB.
 */
const inter = localFont({
  src: "../../fonts/inter-latin-var.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const jetbrains = localFont({
  src: "../../fonts/jetbrains-mono-latin-var.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const url = resolveServerUrl();
  const title = s?.seoTitle ?? "Jay Nguyen";
  const description = s?.seoDescription ?? "";

  return {
    metadataBase: new URL(url),
    title: { default: title, template: `%s — ${s?.name ?? "Jay Nguyen"}` },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "en_AU",
      url,
      siteName: s?.name ?? "Jay Nguyen",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-AU"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrains.variable}`}
    >
      <body>
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
          >
            Skip to content
          </a>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
