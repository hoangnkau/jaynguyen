import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/rich-text";
import { Page } from "@/components/ui";
import { blogIsLive, getPost, getPosts } from "@/lib/queries";
import type { Post, Tag } from "@/payload-types";

type Params = { params: Promise<{ slug: string }> };

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

/**
 * WHY A POST IS READABLE BEFORE THE BLOG "OPENS"
 *
 * The three-post rule (blueprint §8.2) closes the index, the nav link and the
 * sitemap entry, because those are the surfaces that promise a body of writing
 * and then fail to deliver one. A single post makes no such promise: it is one
 * finished piece at a stable URL.
 *
 * Gating this page too would mean publishing a post and being unable to send
 * anyone the link — which pushes towards publishing three at once to unlock
 * the section, and that is how a blog gets three mediocre posts on day one.
 * Publishing is still a deliberate act; drafts remain unreachable by access
 * control in Posts.ts, not by an absent link.
 */
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.publishedAt,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const [post, showIndex] = await Promise.all([getPost(slug), blogIsLive()]);

  // getPost runs with overrideAccess:false, so a draft is a genuine 404 here
  // rather than a page that merely lacks a link to it.
  if (!post) notFound();

  return (
    <Page>
      {/*
        * The back link points at the index only when the index exists. Before
        * that it points home — a "← All writing" link to a 404 would be a
        * self-inflicted broken link, which is the exact class of problem the
        * three-post rule was written to avoid.
        */}
      <Link
        href={showIndex ? "/blog" : "/"}
        className="mb-8 inline-block text-[13.5px] text-muted hover:text-fg"
      >
        {showIndex ? "← All writing" : "← Back home"}
      </Link>

      <article>
        <header className="max-w-[var(--container-prose)]">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <time
              dateTime={post.publishedAt}
              className="font-mono text-[13px] text-muted"
            >
              {formatDate(post.publishedAt)}
            </time>
            {tagNames(post).map((name) => (
              <span
                key={name}
                className="rounded-md border border-border bg-surface-2 px-2.5 py-0.5 font-mono text-[11.5px] text-muted"
              >
                {name}
              </span>
            ))}
          </div>

          <h1 className="mb-4 text-[clamp(1.9rem,4vw,2.6rem)]">{post.title}</h1>
          <p className="text-[17px] leading-relaxed text-muted">{post.summary}</p>
        </header>

        <div className="mt-10 border-t border-border pt-10">
          <RichText data={post.body} className="text-muted" />
        </div>
      </article>

      <footer className="mt-16 max-w-[var(--container-prose)] rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-1 text-[17px]">Working on something like this?</h2>
        <p className="mb-4 text-[14.5px] text-muted">
          I am open to IT, systems and cyber security roles in Darwin and remote
          across Australia — and always happy to talk through a problem.
        </p>
        <Link
          href="/contact"
          className="text-[14.5px] font-semibold text-accent underline underline-offset-4"
        >
          Get in touch →
        </Link>
      </footer>
    </Page>
  );
}
