import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

/**
 * Security headers.
 *
 * A portfolio positioned around cyber security is one an interviewer may
 * actually run through securityheaders.com. These take it from a D to an A.
 *
 * Two policies, deliberately:
 *
 *   PUBLIC SITE  — tight. Static pages, no third-party anything.
 *   /admin, /api — looser, because the Payload admin is a rich React app that
 *                  needs blob: workers and inline styles. It is also noindex
 *                  and behind authentication, so the looser policy is not the
 *                  only thing protecting it.
 *
 * An earlier version of this comment also claimed the admin was WAF-restricted.
 * It is not, and saying so was worse than saying nothing: DNS points straight
 * at Vercel, so no Cloudflare proxy sits in the request path and there is no
 * geo-rule to enforce. The control that does exist is the rate limiter in
 * src/middleware.ts. A comment describing a defence you do not have is how you
 * end up not noticing it is missing.
 *
 * Both policies still allow 'unsafe-inline' for scripts, because Next.js
 * injects inline hydration data. The strict fix is a per-request nonce issued
 * from middleware. The middleware now exists, so this is finally cheap to do —
 * it is simply not done yet. Documented rather than silently ignored.
 */
const BLOB = "https://*.public.blob.vercel-storage.com";

/**
 * React's development build uses eval() to reconstruct call stacks across
 * environments; its production build never does — React says so itself in the
 * console error you get without this.
 *
 * So 'unsafe-eval' is granted in development only. Loosening the production
 * policy to silence a development-only warning would be trading the real
 * protection for the convenience of not seeing a message.
 */
const DEV = process.env.NODE_ENV !== "production";
const evalIfDev = DEV ? " 'unsafe-eval'" : "";

const publicCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${evalIfDev}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${BLOB}`,
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const adminCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${evalIfDev}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${BLOB}`,
  "font-src 'self' data:",
  `connect-src 'self' blob: ${BLOB}`,
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const baseHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // publickey-credentials-get is required for passkeys in Phase 3.
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), publickey-credentials-get=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  /**
   * www is not this site. Anything reaching it is sent to the apex, once, with
   * a 308.
   *
   * This is not tidiness. The admin session cookie is set without a `domain`
   * attribute — deliberately, because scoping it to `.jaynguyen.fyi` would
   * hand it to every present and future subdomain. A host-only cookie set on
   * jaynguyen.fyi is simply not sent to www.jaynguyen.fyi, so on www every
   * request arrives unauthenticated: pages still render (public reads are
   * public), and every write fails with "You are not allowed to perform this
   * action". The passkey ceremony fails there too, because expectedOrigin and
   * expectedRPID come from NEXT_PUBLIC_SERVER_URL, which is the apex.
   *
   * That failure is horrible to diagnose from the inside — the admin looks
   * logged in, and only saving tells you otherwise. Redirecting at the edge
   * means the www host cannot get far enough to produce it.
   *
   * It also settles the SEO question: without this, both hosts serve the whole
   * site and Google has to guess which one is canonical.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.jaynguyen.fyi" }],
        destination: "https://jaynguyen.fyi/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // Everything except the admin and the API.
        source: "/((?!admin|api|auth).*)",
        headers: [
          ...baseHeaders,
          { key: "Content-Security-Policy", value: publicCsp },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          ...baseHeaders,
          { key: "Content-Security-Policy", value: adminCsp },
          // GUARDRAIL (blueprint §8.2): belt and braces with robots.ts.
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          ...baseHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        // WebAuthn endpoints. Same posture as the API: never indexed, and the
        // Permissions-Policy in baseHeaders grants publickey-credentials-get
        // to this origin only.
        source: "/auth/:path*",
        headers: [
          ...baseHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
