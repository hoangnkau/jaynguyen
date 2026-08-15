import { ArrowRight, Download } from "@/components/icons";
import { Button, Container } from "@/components/ui";
import type { Home, SiteSetting } from "@/payload-types";

export function Hero({ home, settings }: { home: Home; settings: SiteSetting }) {
  return (
    <section className="pb-16 pt-20 sm:pb-20 sm:pt-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_220px]">
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

          {/* Headshot slot — Phase 0 deliverable, see blueprint §7 decision 3. */}
          <div
            aria-hidden
            className="hidden size-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center text-[12.5px] text-muted lg:flex"
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
              Headshot goes here
              <br />
              220 × 220
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
