import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { site } from "@/lib/site-config";
import "./globals.css";

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
  src: "../fonts/inter-latin-var.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const jetbrains = localFont({
  src: "../fonts/jetbrains-mono-latin-var.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-AU"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrains.variable}`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
