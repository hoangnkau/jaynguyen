/**
 * One-time seed: moves the Phase 1 content out of src/lib/site-config.ts and
 * into Payload, so the admin opens with the real site already in it rather
 * than an empty shell.
 *
 * Run once:  npm run seed
 * Safe to re-run: it upserts by slug and overwrites globals.
 */
import "./load-env";
import { getPayload } from "payload";
import config from "../payload.config";

/** Minimal Lexical document from plain paragraphs. */
const rich = (paragraphs: string[]) => ({
  root: {
    type: "root",
    format: "" as const,
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    children: paragraphs.map((text) => ({
      type: "paragraph",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      textFormat: 0,
      children: [
        {
          type: "text",
          detail: 0,
          format: 0,
          mode: "normal",
          style: "",
          text,
          version: 1,
        },
      ],
    })),
  },
});

type SeedProject = {
  slug: string;
  title: string;
  stage: "live" | "building" | "archived";
  order: number;
  featured: boolean;
  summary: string;
  proofUrl: string;
  tech: string[];
  isThirdParty?: boolean;
  ownerConsent?: boolean;
};

const PROJECTS: SeedProject[] = [
  {
    slug: "pte-target",
    title: "PTE Target",
    stage: "live",
    order: 10,
    featured: true,
    summary:
      "A Vietnamese-language PTE practice platform with AI scoring, running on a LAMP stack I host and administer myself, exposed publicly through Cloudflare.",
    proofUrl: "https://ptetarget.au",
    tech: ["PHP", "MySQL", "AI"],
  },
  {
    slug: "bnb-fabrics",
    title: "BNB Fabrics",
    stage: "live",
    order: 20,
    featured: true,
    summary:
      "A full e-commerce platform for an Australian textile retailer — storefront, Stripe and PayPal checkout, inventory with stock thresholds, order management, and a role-based admin for staff.",
    proofUrl: "https://bnbfabrics.com.au",
    tech: ["PHP", "MySQL", "Stripe", "OAuth"],
    isThirdParty: true,
    // Owner consent recorded 15 Aug 2026 — the case study may be published.
    // Still no revenue figures, customer data, or real-order screenshots.
    ownerConsent: true,
  },
  {
    slug: "humanize-ai-writing",
    title: "Humanize AI Writing",
    stage: "building",
    order: 30,
    featured: true,
    summary:
      "Detecting AI-generated text and rewriting it into natural prose — served from a self-hosted LLM rather than a paid API, which is where the interesting engineering constraints are.",
    proofUrl: "https://github.com/hoangnkau",
    tech: ["LLM", "Self-hosted", "NLP"],
  },
  {
    slug: "calcroo",
    title: "Calcroo",
    stage: "archived",
    order: 40,
    featured: true,
    summary:
      "Australian finance and utility calculators, built in Next.js. I shut it down after the analytics showed near-zero human traffic. The post-mortem is the useful part.",
    proofUrl: "https://github.com/hoangnkau",
    tech: ["Next.js", "SEO"],
  },
  {
    slug: "curious-why",
    title: "Curious Why",
    stage: "live",
    order: 50,
    featured: false,
    summary:
      "An AI-assisted content pipeline: script generation, segmented image prompts, render and publish. Less a YouTube channel than a workflow automation problem.",
    proofUrl: "https://www.youtube.com/@curiouswhychannel",
    tech: ["Automation", "Gemini"],
  },
];

async function run() {
  const payload = await getPayload({ config });
  const id: Record<string, number> = {};

  for (const p of PROJECTS) {
    const existing = await payload.find({
      collection: "projects",
      where: { slug: { equals: p.slug } },
      limit: 1,
    });
    /**
     * A third-party project without recorded consent is seeded as a DRAFT, not
     * published. The guardrail in Projects.ts refuses to publish it, and that
     * refusal is the point — it is not an obstacle to work around here.
     * BNB Fabrics goes live the moment Jay ticks the box, after the owner
     * has actually agreed.
     */
    const awaitingConsent = Boolean(p.isThirdParty && !p.ownerConsent);
    const data = {
      ...p,
      _status: (awaitingConsent ? "draft" : "published") as "draft" | "published",
    };
    const doc = existing.docs[0]
      ? await payload.update({
          collection: "projects",
          id: existing.docs[0].id,
          data,
          draft: awaitingConsent,
        })
      : await payload.create({ collection: "projects", data, draft: awaitingConsent });
    id[p.slug] = (doc as { id: number }).id;
    console.log(
      `  project: ${p.title}${awaitingConsent ? "  [DRAFT — awaiting owner consent]" : ""}`,
    );
  }

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      name: "Jay Nguyen",
      legalName: "Khanh Hoang (Jay) Nguyen",
      domain: "jaynguyen.fyi",
      location: "Darwin, NT, Australia",
      email: "hoangnk.au@gmail.com",
      openToWorkEnabled: true,
      openToWorkPill: "Open to roles in Darwin & remote Australia",
      openToWorkHeading:
        "Open to IT, systems and cyber security roles in Darwin and remote across Australia.",
      openToWorkBody:
        "The fastest way to reach me is email — I answer within a day. Happy to talk about a role, a project, or something you're stuck on.",
      socials: [
        { label: "Email", href: "mailto:hoangnk.au@gmail.com" },
        { label: "LinkedIn", href: "https://www.linkedin.com/in/jay-nguyen" },
        { label: "YouTube", href: "https://www.youtube.com/@curiouswhychannel" },
      ],
      seoTitle: "Jay Nguyen — IT Systems & Cyber Security | Darwin, NT",
      seoDescription:
        "Khanh Hoang (Jay) Nguyen — 20+ years in IT infrastructure and network administration, MSc Computer Science with Cyber Security (University of York). Based in Darwin, NT, Australia.",
    },
  });
  console.log("  global: site-settings");

  await payload.updateGlobal({
    slug: "home",
    data: {
      heading: "Jay Nguyen",
      tagline: "I build and secure the systems that keep an organisation running",
      taglineAccent:
        "from the hardware up to the network and the numbers on top of it.",
      sub: "20+ years across infrastructure, project delivery and campus operations. Currently Campus Coordinator at Canterbury Institute of Management, Darwin, and completing an MSc in Computer Science with Cyber Security at the University of York.",
      stats: [
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
            "University of York, MSc Computer Science with Cyber Security, 13 Jan 2025 – 10 Jan 2027.",
        },
        {
          value: "3",
          label: "Side projects live and running right now",
          justification:
            "ptetarget.au, bnbfabrics.com.au, Curious Why — all publicly reachable.",
        },
      ],
      capabilitiesEyebrow: "What I do",
      capabilitiesTitle: "Four layers of the same stack",
      capabilitiesLead:
        "Most people pick one end — the hardware, the network, the security model, or the ledger. Twenty years of the first two, a Master's in the third and a degree in the fourth means I can hold the whole conversation.",
      capabilities: [
        {
          icon: "hardware",
          title: "Hardware & User Support",
          body: "Building and installing PCs from components, setting up communication devices and peripherals, and being first point of contact for a whole campus — resolving faults before they turn into tickets.",
          chips: ["PC assembly", "Hardware install", "Comms devices", "VoIP", "Helpdesk"],
          evidence: id["bnb-fabrics"],
        },
        {
          icon: "network",
          title: "Networks & Infrastructure",
          body: "Network configuration and administration, web and mail servers, VPN troubleshooting, hosting and colocation. I still run my own production stack — PTE Target serves public traffic from hardware I administer myself.",
          chips: ["Network config", "Network admin", "VPN", "Linux", "Apache", "Cloudflare"],
          evidence: id["pte-target"],
        },
        {
          icon: "security",
          title: "Security & Access Control",
          body: "Completing an MSc in Computer Science with Cyber Security at York, researching whether the MFA methods we recommend are ones people will actually keep using. In practice: role-based admin systems, OAuth, and passkey authentication — including the one guarding this site.",
          chips: ["MFA / FIDO2", "Passkeys", "RBAC", "OAuth 2.0", "ISO 27001"],
          evidence: id["bnb-fabrics"],
        },
        {
          icon: "finance",
          title: "Finance & Administration",
          body: "A Bachelor of Accounting on top of the technical background. Database reporting, reconciliations, and the administrative machinery that sits behind an education provider.",
          chips: ["Excel", "SQL reporting", "Reconciliation", "BAS basics"],
          evidence: id["calcroo"],
        },
      ],
      howIWork: [
        {
          title: "Applied AI",
          body: "Four projects, three integration patterns: an AI scoring pipeline, an automated content pipeline, and self-hosted inference. I cost the API out before I commit to it.",
          chips: ["LLM APIs", "Self-hosted", "Scoring"],
        },
        {
          title: "Self-hosted infrastructure",
          body: "PTE Target serves public traffic from a single machine I own, fronted by Cloudflare and administered remotely. Anyone can deploy to a PaaS; I know what it costs to run it myself.",
          chips: ["LAMP", "Cloudflare", "Remote admin"],
        },
        {
          title: "Product judgement",
          body: "I shut Calcroo down once the analytics showed the traffic was bots. Picking a defensible niche, and knowing when to stop, has saved me more time than any framework.",
          chips: ["Analytics", "Post-mortems"],
        },
        {
          title: "Bilingual delivery",
          body: "Not just two languages — products built for two markets. PTE Target is Vietnamese-first for an Australian audience, documented in both.",
          chips: ["EN / VI", "Localisation", "Docs"],
        },
      ],
      workTitle: "Things I've actually shipped",
      workLead:
        "Honestly labelled: what's in production, what's still being built, and one I shut down on purpose.",
      currentlyUpdated: "Aug 2026",
      currentlyItems: [
        {
          text: "**Campus Coordinator** at Canterbury Institute of Management, Darwin — IT, student support and campus administration.",
        },
        {
          text: "Completing an **MSc in Computer Science with Cyber Security** at the University of York, part-time online — graduating January 2027.",
        },
        {
          text: "Writing my research proposal: a task-based usability evaluation of **three MFA methods** — TOTP, FIDO2 security keys and SMS codes.",
        },
        {
          text: "Building out **PTE Target** — currently on shared result links and practice-log quotas.",
        },
        { text: "Prototyping **Humanize AI Writing** on self-hosted inference." },
      ],
    },
  });
  console.log("  global: home");

  await payload.updateGlobal({
    slug: "about",
    data: {
      bio: rich([
        "I started fixing computers in Ho Chi Minh City in 1998 and never really stopped. Over twenty years I moved from the bench to the network rack to the project plan — first as a technician at the Department of Science & Technology in Dong Nai, then running my own IT company, administering servers and VPNs for provincial government and corporate clients.",
        "In 2019 I moved to Darwin and did something that surprised people: I went back to university for a Bachelor of Accounting. After two decades of building systems, I wanted to understand the numbers those systems were carrying. I finished at Charles Darwin University in 2022 and completed the Professional Year in 2023.",
        "Then I went back to where I started, but deeper. Since January 2025 I've been studying part-time for an MSc in Computer Science with Cyber Security at the University of York, graduating January 2027. My research is on multi-factor authentication — not whether it works, but whether people will actually keep using it.",
        "Today I'm Campus Coordinator at Canterbury Institute of Management's Darwin campus: first point of contact for students and staff, keeping the campus IT running, and handling the administrative side. Outside work I build things — most recently PTE Target, an English-exam practice platform I run on my own hardware.",
      ]),
      timeline: [
        {
          period: "Jan 2025 – Jan 2027",
          role: "MSc Computer Science with Cyber Security (part-time, online)",
          organisation: "University of York, UK",
        },
        {
          period: "Oct 2022 – present",
          role: "IT & Student Support Officer → Campus Coordinator",
          organisation: "Canterbury Institute of Management, Darwin",
        },
        {
          period: "Oct 2020 – Oct 2022",
          role: "IT Systems Consultant (freelance)",
          organisation: "Sonadezi · Dong Nai Tourist · DOST Dong Nai · Agent Hai Pty Ltd",
        },
        {
          period: "Oct 2010 – Nov 2019",
          role: "Director / IT Project Manager — own IT company",
          organisation: "Equatorial Technology JSC (E-Tech), Vietnam",
        },
        {
          period: "Oct 2003 – Sep 2010",
          role: "IT Technician",
          organisation: "Dept. of Science & Technology, Dong Nai Province",
        },
      ],
      credentials: [
        {
          award: "MSc Computer Science with Cyber Security",
          institution: "University of York",
          year: "2027",
          inProgress: true,
        },
        { award: "Professional Year of Accounting", institution: "Charles Darwin University", year: "2023" },
        { award: "Bachelor of Accounting", institution: "Charles Darwin University", year: "2022" },
        {
          award: "ISO/IEC 27001:2005 Internal ISMS Auditor",
          institution: "DAS Vietnam Certification",
          year: "2008",
        },
        { award: "Network Specialist", institution: "VNU-HCM University of Science", year: "2003" },
        {
          award: "Computer Assembly & Maintenance",
          institution: "VNU-HCM University of Science",
          year: "1998",
        },
      ],
      skillGroups: [
        {
          group: "Hardware",
          skills: [
            "PC assembly & build from components",
            "Hardware and peripheral installation",
            "Communication device setup",
            "VoIP configuration",
            "Diagnostics & repair",
          ],
        },
        {
          group: "Networks & infrastructure",
          skills: [
            "Network configuration",
            "Network administration",
            "VPN troubleshooting",
            "Windows/Linux server admin",
            "Web hosting & colocation",
          ],
        },
        {
          group: "Security",
          skills: [
            "Multi-factor authentication (TOTP, FIDO2/WebAuthn)",
            "Threat analysis",
            "Security engineering",
            "ISMS / ISO 27001 internal auditing",
          ],
        },
        {
          group: "Authentication & access control",
          skills: [
            "Role-based permission models",
            "OAuth 2.0 (Google, Facebook)",
            "Passkey/WebAuthn implementation",
            "Session and credential handling",
          ],
        },
        {
          group: "Applied AI",
          skills: [
            "LLM API integration",
            "Self-hosted inference on constrained hardware",
            "AI scoring and evaluation pipelines",
            "Cost modelling before committing to an API",
          ],
        },
        {
          group: "Finance & data",
          skills: [
            "Excel (advanced)",
            "BAS & payroll fundamentals",
            "Database administration & reporting",
            "SQL / phpMyAdmin",
          ],
        },
      ],
      beyondWork:
        "Bilingual in English and Vietnamese, active in Darwin's Vietnamese community, and a home lab that has outgrown its shelf.",
    },
  });
  console.log("  global: about");

  await payload.updateGlobal({
    slug: "cv",
    data: { lastUpdated: new Date().toISOString() },
  });
  console.log("  global: cv");

  const held = PROJECTS.filter((p) => p.isThirdParty && !p.ownerConsent);
  if (held.length) {
    console.log(
      `\n  ${held.length} project(s) held as draft pending owner consent: ${held
        .map((p) => p.title)
        .join(", ")}`,
    );
    console.log("  Tick the consent box in /admin once the owner has agreed.");
  }
  console.log("\nSeed complete. Open /admin to edit.");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
