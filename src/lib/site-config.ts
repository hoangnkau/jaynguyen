/**
 * TEMPORARY CONTENT SOURCE — Phase 1 only.
 *
 * In Phase 2 this file is replaced by Payload CMS globals and collections.
 * The components that read it are written against these same shapes, so the
 * swap is a change of data source, not a rewrite of the UI.
 *
 * GUARDRAIL (blueprint §8.1): every skill carries an `evidence` slug pointing
 * at a project. In Payload this becomes a required relationship field. Here it
 * is a required TypeScript property, so the build fails if one is missing.
 */

export type ProjectStatus = "live" | "building" | "archived";

export interface Project {
  slug: string;
  title: string;
  status: ProjectStatus;
  summary: string;
  /** Live URL, repo, or public channel. Blueprint §8.1: no card without proof. */
  proofUrl: string;
  tech: string[];
  featured: boolean;
  /** Built for someone else's business — gates the case study on consent. */
  isThirdParty?: boolean;
  ownerConsent?: boolean;
}

export interface Capability {
  title: string;
  body: string;
  chips: string[];
  /** Slug of the project that demonstrates this. Required by design. */
  evidence: Project["slug"];
  icon: "hardware" | "network" | "security" | "finance";
}

export const site = {
  name: "Jay Nguyen",
  legalName: "Khanh Hoang (Jay) Nguyen",
  domain: "jaynguyen.fyi",
  url: "https://jaynguyen.fyi",
  location: "Darwin, NT, Australia",
  email: "hoangnk.au@gmail.com",
  title: "Jay Nguyen — IT Systems & Cyber Security | Darwin, NT",
  description:
    "Khanh Hoang (Jay) Nguyen — 20+ years in IT infrastructure and network administration, MSc Computer Science with Cyber Security (University of York). Based in Darwin, NT, Australia.",
  openToWork: {
    enabled: true,
    pill: "Open to roles in Darwin & remote Australia",
    heading:
      "Open to IT, systems and cyber security roles in Darwin and remote across Australia.",
    body: "The fastest way to reach me is email — I answer within a day. Happy to talk about a role, a project, or something you're stuck on.",
  },
  socials: [
    { label: "Email", href: "mailto:hoangnk.au@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jay-nguyen" },
    { label: "YouTube", href: "https://www.youtube.com/@curiouswhychannel" },
  ],
  nav: [
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export const hero = {
  heading: "Jay Nguyen",
  tagline: "I build and secure the systems that keep an organisation running",
  taglineAccent: "from the hardware up to the network and the numbers on top of it.",
  sub: "20+ years across infrastructure, project delivery and campus operations. Currently Campus Coordinator at Canterbury Institute of Management, Darwin, and completing an MSc in Computer Science with Cyber Security at the University of York.",
};

/**
 * GUARDRAIL (blueprint §8.1): every stat carries a `justification`.
 * It is never rendered — it exists to make you pause before typing a number.
 */
export const stats = [
  {
    value: "20+",
    label: "Years in IT, from the bench to the project plan",
    justification: "IT Technician from Oct 2003, continuous to present — 22 years.",
  },
  {
    value: "2",
    label: "Countries of operation — Vietnam, then Australia",
    justification: "Vietnam 1998–2019, Australia 2019–present.",
  },
  {
    value: "MSc",
    label: "Cyber Security at York — completing Jan 2027",
    justification:
      "University of York, MSc Computer Science with Cyber Security, enrolled 13 Jan 2025, expected end 10 Jan 2027.",
  },
  {
    value: "3",
    label: "Side projects live and running right now",
    justification: "ptetarget.au, bnbfabrics.com.au, Curious Why channel — all publicly reachable.",
  },
];

export const capabilities: Capability[] = [
  {
    icon: "hardware",
    title: "Hardware & User Support",
    body: "Building and installing PCs from components, setting up communication devices and peripherals, and being first point of contact for a whole campus — resolving faults before they turn into tickets.",
    chips: ["PC assembly", "Hardware install", "Comms devices", "VoIP", "Helpdesk"],
    evidence: "bnb-fabrics",
  },
  {
    icon: "network",
    title: "Networks & Infrastructure",
    body: "Network configuration and administration, web and mail servers, VPN troubleshooting, hosting and colocation. I still run my own production stack — PTE Target serves public traffic from hardware I administer myself.",
    chips: ["Network config", "Network admin", "VPN", "Linux", "Apache", "Cloudflare"],
    evidence: "pte-target",
  },
  {
    icon: "security",
    title: "Security & Access Control",
    body: "Completing an MSc in Computer Science with Cyber Security at York, researching whether the MFA methods we recommend are ones people will actually keep using. In practice: role-based admin systems, OAuth, and passkey authentication — including the one guarding this site.",
    chips: ["MFA / FIDO2", "Passkeys", "RBAC", "OAuth 2.0", "ISO 27001"],
    evidence: "bnb-fabrics",
  },
  {
    icon: "finance",
    title: "Finance & Administration",
    body: "A Bachelor of Accounting on top of the technical background. Database reporting, reconciliations, and the administrative machinery that sits behind an education provider.",
    chips: ["Excel", "SQL reporting", "Reconciliation", "BAS basics"],
    evidence: "calcroo",
  },
];

export const howIWork = [
  {
    n: "01",
    title: "Applied AI",
    body: "Four projects, three integration patterns: an AI scoring pipeline, an automated content pipeline, and self-hosted inference. I cost the API out before I commit to it.",
    chips: ["LLM APIs", "Self-hosted", "Scoring"],
  },
  {
    n: "02",
    title: "Self-hosted infrastructure",
    body: "PTE Target serves public traffic from a single machine I own, fronted by Cloudflare and administered remotely. Anyone can deploy to a PaaS; I know what it costs to run it myself.",
    chips: ["LAMP", "Cloudflare", "Remote admin"],
  },
  {
    n: "03",
    title: "Product judgement",
    body: "I shut Calcroo down once the analytics showed the traffic was bots. Picking a defensible niche, and knowing when to stop, has saved me more time than any framework.",
    chips: ["Analytics", "Post-mortems"],
  },
  {
    n: "04",
    title: "Bilingual delivery",
    body: "Not just two languages — products built for two markets. PTE Target is Vietnamese-first for an Australian audience, documented in both.",
    chips: ["EN / VI", "Localisation", "Docs"],
  },
];

export const projects: Project[] = [
  {
    slug: "pte-target",
    title: "PTE Target",
    status: "live",
    summary:
      "A Vietnamese-language PTE practice platform with AI scoring, running on a LAMP stack I host and administer myself, exposed publicly through Cloudflare.",
    proofUrl: "https://ptetarget.au",
    tech: ["PHP", "MySQL", "AI"],
    featured: true,
  },
  {
    slug: "bnb-fabrics",
    title: "BNB Fabrics",
    status: "live",
    summary:
      "A full e-commerce platform for an Australian textile retailer — storefront, Stripe and PayPal checkout, inventory with stock thresholds, order management, and a role-based admin for staff.",
    proofUrl: "https://bnbfabrics.com.au",
    tech: ["PHP", "MySQL", "Stripe", "OAuth"],
    featured: true,
    isThirdParty: true,
    ownerConsent: false, // GUARDRAIL: case study stays unpublished until this is true.
  },
  {
    slug: "humanize-ai-writing",
    title: "Humanize AI Writing",
    status: "building",
    summary:
      "Detecting AI-generated text and rewriting it into natural prose — served from a self-hosted LLM rather than a paid API, which is where the interesting engineering constraints are.",
    proofUrl: "https://github.com/",
    tech: ["LLM", "Self-hosted", "NLP"],
    featured: true,
  },
  {
    slug: "calcroo",
    title: "Calcroo",
    status: "archived",
    summary:
      "Australian finance and utility calculators, built in Next.js. I shut it down after the analytics showed near-zero human traffic. The post-mortem is the useful part.",
    proofUrl: "https://github.com/",
    tech: ["Next.js", "SEO"],
    featured: true,
  },
  {
    slug: "curious-why",
    title: "Curious Why",
    status: "live",
    summary:
      "An AI-assisted content pipeline: script generation, segmented image prompts, render and publish. Less a YouTube channel than a workflow automation problem.",
    proofUrl: "https://www.youtube.com/@curiouswhychannel",
    tech: ["Automation", "Gemini"],
    featured: false,
  },
];

export const currently = {
  updated: "Aug 2026",
  items: [
    "**Campus Coordinator** at Canterbury Institute of Management, Darwin — IT, student support and campus administration.",
    "Completing an **MSc in Computer Science with Cyber Security** at the University of York, part-time online — graduating January 2027.",
    "Writing my research proposal: a task-based usability evaluation of **three MFA methods** — TOTP, FIDO2 security keys and SMS codes.",
    "Building out **PTE Target** — currently on shared result links and practice-log quotas.",
    "Prototyping **Humanize AI Writing** on self-hosted inference.",
  ],
};

/**
 * GUARDRAIL (blueprint §8.2): the blog does not exist publicly until three
 * posts do. Nav item and home section both key off this array's length.
 */
export const posts: { slug: string; title: string; date: string; summary: string; tag: string }[] =
  [];

export const MIN_POSTS_TO_SHOW_BLOG = 3;
export const blogIsLive = posts.length >= MIN_POSTS_TO_SHOW_BLOG;
