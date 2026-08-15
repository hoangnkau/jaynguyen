import Image from "next/image";
import { ArrowRight, Download } from "@/components/icons";
import { Button, Container } from "@/components/ui";
import { toImageSrc } from "@/lib/media-url";
import type { Home, Media, SiteSetting } from "@/payload-types";

export function Hero({
  home,
  settings,
  portrait,
}: {
  home: Home;
  settings: SiteSetting;
  /**
   * The same image /about uses, read from the About global.
   *
   * There is deliberately no separate "hero photo" field. Two upload fields
   * for one face is two things to keep in step, and the failure mode is
   * silent: you change one, the other keeps showing a photo from two years
   * ago and nothing anywhere tells you.
   */
  portrait?: Media | null;
}) {
  const portraitSrc = toImageSrc(portrait?.url);
  const hasPortrait = Boolean(portraitSrc);

  return (
    <section className="pb-16 pt-20 sm:pb-20 sm:pt-28">
      <Container>
        <div
          className={`grid items-center gap-12 ${
            hasPortrait ? "lg:grid-cols-[1fr_220px]" : ""
          }`}
        >
          <div>
            {settings.openToWorkEnabled && settings.openToWorkPill && (
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-[13px] text-muted">
                <span className="size-[7px] rounded-full bg-live ring-[3px] ring-live-soft" />
                {settings.openToWorkPill}
              </p>
            )}

            <h1 className="mb-6 text-[clamp(2.4rem,5.6vw,3.6rem)] tracking-[-0.035em]">
              {home.heading}
            </h1>

            <p className="mb-4 max-w-[640px] text-[clamp(1.2rem,2.3vw,1.44rem)] font-normal leading-[1.5]">
              {home.tagline} —{" "}
              <span className="font-medium text-accent">{home.taglineAccent}</span>
            </p>

            <p className="mb-8 max-w-[560px] text-base text-muted">{home.sub}</p>

            <div className="flex flex-wrap gap-3">
              <Button href="#work">
                View my work
                <ArrowRight className="size-4" />
              </Button>
              <Button href="/cv" variant="ghost">
                <Download className="size-4" />
                Download CV
              </Button>
            </div>
          </div>

          {/*
            * The headshot slot.
            *
            * Shown from `lg` up only. Below that the photo would push the
            * tagline — the one sentence that has to land — off the first
            * screen on a phone, and the same face appears on /about anyway.
            *
            * `priority` IS set here, unlike the /about copy. This one is above
            * the fold on every desktop viewport, so it is a Largest
            * Contentful Paint candidate; letting Next lazy-load it means the
            * hero visibly completes late.
            *
            * object-top rather than object-center: the source is a 4:5
            * portrait and the slot is taller than it is wide, so centring the
            * crop trims the top of the head before it trims the shirt.
            */}
          {portraitSrc && portrait && (
            <div className="hidden w-[220px] overflow-hidden rounded-2xl border border-border bg-surface lg:block">
              <Image
                src={portraitSrc}
                alt={portrait.alt}
                width={portrait.width ?? 880}
                height={portrait.height ?? 1100}
                sizes="220px"
                priority
                className="aspect-[4/5] w-full object-cover object-top"
              />
            </div>
          )}

          {/*
            * The old placeholder, kept but no longer shipped.
            *
            * It existed to stop the slot being forgotten, and it worked. What
            * it should never have done is reach a visitor: "Headshot goes here
            * 220 × 220" sat on the live home page, which is worse than an
            * empty column by some distance. Development still gets the
            * reminder; production gets nothing at all.
            */}
          {!hasPortrait && process.env.NODE_ENV !== "production" && (
            <div
              aria-hidden
              className="hidden size-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-4 text-center text-[12.5px] text-muted lg:flex"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="size-10 opacity-35"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
              <span>
                No portrait set
                <br />
                /admin → About
              </span>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
