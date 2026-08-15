import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/queries";

export const alt = "Jay Nguyen — IT Systems & Cyber Security, Darwin NT";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The picture that appears when the site is pasted into LinkedIn, Slack or a
 * message. Without it a shared link renders as a blank card, which is the
 * least persuasive version of a portfolio a recruiter can meet.
 *
 * Generated from the CMS, so it follows the site rather than going stale in a
 * design file. System fonts only: next/og cannot use next/font, and fetching a
 * font at render time would make this fail when the network hiccups.
 */
export default async function OpengraphImage() {
  const s = await getSiteSettings();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAFAF9",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 20, height: 20, borderRadius: 999, background: "#B8451F" }} />
          <div style={{ fontSize: 30, color: "#52525B", letterSpacing: -0.5 }}>
            {s?.domain ?? "jaynguyen.fyi"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 86,
              fontWeight: 700,
              color: "#18181B",
              letterSpacing: -3,
              lineHeight: 1.05,
            }}
          >
            {s?.name ?? "Jay Nguyen"}
          </div>
          <div
            style={{
              fontSize: 38,
              color: "#3F3F46",
              marginTop: 20,
              lineHeight: 1.35,
              maxWidth: 900,
            }}
          >
            I build and secure the systems that keep an organisation running.
          </div>
        </div>

        {/* nowrap on each item: without it the three facts each break to two
            lines and the row reads as a jumble at thumbnail size. */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 25, color: "#52525B" }}>
          <div style={{ whiteSpace: "nowrap" }}>20+ years in IT</div>
          <div style={{ color: "#B8451F" }}>·</div>
          <div style={{ whiteSpace: "nowrap" }}>MSc Cyber Security, York</div>
          <div style={{ color: "#B8451F" }}>·</div>
          <div style={{ whiteSpace: "nowrap" }}>Darwin, NT</div>
        </div>
      </div>
    ),
    size,
  );
}
