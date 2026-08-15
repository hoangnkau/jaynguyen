import { Hero } from "@/components/home/hero";
import { ProofBar } from "@/components/home/proof-bar";
import { Capabilities } from "@/components/home/capabilities";
import { HowIWork } from "@/components/home/how-i-work";
import { FeaturedWork } from "@/components/home/featured-work";
import { Currently } from "@/components/home/currently";
import { LatestWriting } from "@/components/home/latest-writing";
import { ContactCta } from "@/components/home/contact-cta";
import { PersonSchema } from "@/components/person-schema";
import {
  blogIsLive,
  getAbout,
  getHome,
  getPosts,
  getProjects,
  getSiteSettings,
} from "@/lib/queries";

/** Three is the section, not the archive. */
const LATEST_COUNT = 3;

export default async function HomePage() {
  const [home, settings, projects, posts, showBlog, about] = await Promise.all([
    getHome(),
    getSiteSettings(),
    getProjects(),
    getPosts(),
    blogIsLive(),
    getAbout(),
  ]);

  /**
   * The portrait is stored once, on the About global, and used in three
   * places: the hero, /about, and the Person schema's `image`.
   *
   * A bare ID rather than an object means the upload is not publicly
   * readable — the reads run with overrideAccess: false — so this narrowing
   * is the access check, not defensive typing. An unreadable image in
   * structured data is a broken link Google keeps hold of.
   */
  const portrait =
    typeof about.portrait === "object" && about.portrait !== null
      ? about.portrait
      : null;

  return (
    <>
      <PersonSchema settings={settings} imageUrl={portrait?.url} />
      <Hero home={home} settings={settings} portrait={portrait} />
      <ProofBar stats={home.stats ?? []} />
      <Capabilities home={home} />
      <HowIWork items={home.howIWork ?? []} />
      <FeaturedWork home={home} projects={projects} totalCount={projects.length} />
      <Currently home={home} />
      {/* GUARDRAIL (blueprint §8.2): the same three-post gate as the nav, the
          /blog route and the sitemap. Passing an empty array renders nothing. */}
      <LatestWriting posts={showBlog ? posts.slice(0, LATEST_COUNT) : []} />
      <ContactCta settings={settings} />
    </>
  );
}
