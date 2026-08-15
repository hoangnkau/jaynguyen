import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Button, Container, Eyebrow, Lead, Section, SectionTitle } from "@/components/ui";
import type { Post } from "@/payload-types";

/**
 * Blueprint §3.1 row 6 — "Latest writing", hidden until three posts exist.
 *
 * The gate is not applied here. The caller passes only what should be shown,
 * because /, /blog, the nav and the sitemap all have to agree on one answer
 * and four components each asking the database the same question is four
 * chances for them to disagree.
 */
export function LatestWriting({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;

  return (
    <Section id="writing" tight>
      <Container>
        <Eyebrow>Latest writing</Eyebrow>
        <SectionTitle>Notes from the build</SectionTitle>
        <Lead>
          Working notes on authentication, self-hosted infrastructure, and the
          occasional decision to stop.
        </Lead>

        <ul className="mt-10 border-t border-border">
          {posts.map((post) => (
            <li key={post.id} className="border-b border-border">
              <Link
                href={`/blog/${post.slug}`}
                className="group grid gap-1.5 py-5 sm:grid-cols-[150px_1fr]"
              >
                <time
                  dateTime={post.publishedAt}
                  className="font-mono text-[13px] text-muted"
                >
                  {new Date(post.publishedAt).toLocaleDateString("en-AU", {
                    month: "short",
                    year: "numeric",
                  })}
                </time>
                <div>
                  <h3 className="text-[17px] transition-colors group-hover:text-accent">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-muted">
                    {post.summary}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Button href="/blog" variant="ghost">
            All writing
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </Container>
    </Section>
  );
}
