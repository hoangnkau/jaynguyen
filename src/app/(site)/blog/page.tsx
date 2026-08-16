import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page, PageHeader } from "@/components/ui";
import { blogIsLive, getPosts, MIN_POSTS_TO_SHOW_BLOG } from "@/lib/queries";
import type { Post, Tag } from "@/payload-types";
import { PagePattern } from "@/components/page-pattern";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes on infrastructure, authentication and the decisions behind the projects on this site.",
  alternates: { canonical: "/blog" },
};

/** Tags populate as objects at depth 2, as bare IDs when they are not readable. */
const tagNames = (post: Post) =>
  (post.tags ?? [])
    .filter((t): t is Tag => typeof t === "object" && t !== null)
    .map((t) => t.name)
    .filter(Boolean);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default async function BlogIndexPage() {
  /**
   * GUARDRAIL (blueprint §8.2), enforced in the route and not only in the nav.
   *
   * Hiding the link while leaving the page reachable is theatre: /blog is the
   * first URL anyone types, and finding one post under a heading that promises
   * writing is precisely the "empty blog" the rule exists to prevent. The nav
   * hides it, the sitemap omits it, and this returns a real 404 — three places
   * that must agree, all keyed off the same count.
   *
   * Individual posts are deliberately NOT gated this way. See
   * blog/[slug]/page.tsx for why.
   */
  if (!(await blogIsLive())) notFound();

  const posts = await getPosts();

  return (
    <>
      <PagePattern name="rules" />
      <Page>
        <PageHeader
          eyebrow="Writing"
          title="Notes from the build"
          lead={`Working notes on the things this site is made of — authentication, self-hosted infrastructure, and the occasional decision to stop. Published when there is something worth saying, which is why there are ${posts.length} and not ${posts.length * 10}.`}
        />

        <ol className="mt-16 border-t border-border">
          {posts.map((post) => (
            <li key={post.id} className="border-b border-border">
              <Link
                href={`/blog/${post.slug}`}
                className="group grid gap-2 py-7 sm:grid-cols-[170px_1fr]"
              >
                <time
                  dateTime={post.publishedAt}
                  className="font-mono text-[13px] text-muted"
                >
                  {formatDate(post.publishedAt)}
                </time>

                <div>
                  <h2 className="mb-1.5 text-[19px] transition-colors group-hover:text-accent">
                    {post.title}
                  </h2>
                  <p className="mb-3 text-[14.5px] leading-relaxed text-muted">
                    {post.summary}
                  </p>
                  {!!tagNames(post).length && (
                    <ul className="flex flex-wrap gap-1.5">
                      {tagNames(post).map((name) => (
                        <li
                          key={name}
                          className="rounded-md border border-border bg-surface-2 px-2.5 py-0.5 font-mono text-[11.5px] text-muted"
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ol>

        {/*
         * A count, stated rather than implied. The blueprint's threshold is a
         * decision this site is willing to explain; a reader who knows the rule
         * reads three posts as a start, not as neglect.
         */}
        <p className="mt-10 text-[13.5px] text-muted">
          This page appears once {MIN_POSTS_TO_SHOW_BLOG} posts are published —
          no placeholder posts, no &ldquo;coming soon&rdquo;.
        </p>
      </Page>
    </>
  );
}
