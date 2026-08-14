import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
