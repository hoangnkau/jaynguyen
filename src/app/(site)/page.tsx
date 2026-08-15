import { Hero } from "@/components/home/hero";
import { ProofBar } from "@/components/home/proof-bar";
import { Capabilities } from "@/components/home/capabilities";
import { HowIWork } from "@/components/home/how-i-work";
import { FeaturedWork } from "@/components/home/featured-work";
import { Currently } from "@/components/home/currently";
import { ContactCta } from "@/components/home/contact-cta";
import { PersonSchema } from "@/components/person-schema";
import { getHome, getProjects, getSiteSettings } from "@/lib/queries";

export default async function HomePage() {
  const [home, settings, projects] = await Promise.all([
    getHome(),
    getSiteSettings(),
    getProjects(),
  ]);

  return (
    <>
      <PersonSchema settings={settings} />
      <Hero home={home} settings={settings} />
      <ProofBar stats={home.stats ?? []} />
      <Capabilities home={home} />
      <HowIWork items={home.howIWork ?? []} />
      <FeaturedWork home={home} projects={projects} totalCount={projects.length} />
      <Currently home={home} />
      {/* Latest writing renders here in Phase 6 — hidden until 3 posts exist. */}
      <ContactCta settings={settings} />
    </>
  );
}
