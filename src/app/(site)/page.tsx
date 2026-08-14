import { Hero } from "@/components/home/hero";
import { ProofBar } from "@/components/home/proof-bar";
import { Capabilities } from "@/components/home/capabilities";
import { HowIWork } from "@/components/home/how-i-work";
import { FeaturedWork } from "@/components/home/featured-work";
import { Currently } from "@/components/home/currently";
import { ContactCta } from "@/components/home/contact-cta";
import { PersonSchema } from "@/components/person-schema";

export default function HomePage() {
  return (
    <>
      <PersonSchema />
      <Hero />
      <ProofBar />
      <Capabilities />
      <HowIWork />
      <FeaturedWork />
      <Currently />
      {/* Latest writing renders here in Phase 6 — hidden until 3 posts exist. */}
      <ContactCta />
    </>
  );
}
