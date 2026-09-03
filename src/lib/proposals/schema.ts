export type ProposalSection = {
  id: string;
  title: string;
  body: string;
  enabled: boolean;
  custom?: boolean;
};

export type Proposal = {
  id: string;
  lead_id: string | null;
  reference: string;
  title: string;
  subtitle: string | null;
  client_name: string | null;
  project_name: string | null;
  description: string | null;
  template: string;
  accent_color: string;
  secondary_color: string;
  logo_url: string | null;
  sections: ProposalSection[];
  recommended_plan: string | null;
  estimated_range: string | null;
  official_quote: string | null;
  timeline: string | null;
  support_period: string | null;
  notes: string | null;
  terms: string | null;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
};

export type ProposalVersion = {
  id: string;
  proposal_id: string;
  version: number;
  change_summary: string | null;
  editor_email: string | null;
  previous_pricing: string | null;
  new_pricing: string | null;
  created_at: string;
};

export const PROPOSAL_STATUSES = ["draft", "review", "sent", "accepted", "declined"] as const;

export const PROPOSAL_TEMPLATES = [
  {
    id: "premium",
    name: "PixelSpark Premium",
    description: "Signature luxury white / black / gold layout.",
    accent: "#C9A227",
    secondary: "#111111",
  },
  {
    id: "minimal",
    name: "Minimal Business",
    description: "Clean, restrained, professional.",
    accent: "#1F2937",
    secondary: "#111111",
  },
  {
    id: "hospitality",
    name: "Luxury Hospitality",
    description: "Warm editorial styling for hotels and resorts.",
    accent: "#A87F3F",
    secondary: "#2B211A",
  },
] as const;

export const STANDARD_SECTIONS: { id: string; title: string }[] = [
  { id: "cover", title: "Cover" },
  { id: "client", title: "Client Information" },
  { id: "overview", title: "Project Overview" },
  { id: "goals", title: "Business Goals" },
  { id: "solution", title: "Recommended Solution" },
  { id: "pages", title: "Proposed Pages" },
  { id: "features", title: "Features" },
  { id: "integrations", title: "Integrations" },
  { id: "design", title: "Design Direction" },
  { id: "package", title: "Recommended Package" },
  { id: "requirements", title: "Additional Requirements" },
  { id: "pricing", title: "Pricing" },
  { id: "timeline", title: "Estimated Timeline" },
  { id: "support", title: "Support" },
  { id: "next-steps", title: "Next Steps" },
  { id: "contact", title: "PixelSpark Contact Information" },
];

export const CUSTOM_SECTION_IDEAS = [
  "Why PixelSpark",
  "Competitor Analysis",
  "Project Strategy",
  "Technical Architecture",
  "Additional Notes",
  "Custom Requirements",
  "Client Responsibilities",
  "Future Expansion",
];

function list(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function bullets(items: string[]) {
  return items.map((i) => `- ${i}`).join("\n");
}

/** Builds the default 16 sections, pre-filled from a Goldie project brief. */
export function defaultSections(state: Record<string, unknown> = {}, lead: Record<string, unknown> = {}) {
  const text = (key: string) => {
    const v = state[key] ?? lead[key];
    return typeof v === "string" && v.trim() ? v.trim() : "";
  };

  const bodies: Record<string, string> = {
    cover: "",
    client: [
      text("client_name") && `Contact: ${text("client_name")}`,
      text("business_name") && `Business: ${text("business_name")}`,
      text("business_type") && `Industry: ${text("business_type")}`,
      text("location") && `Location: ${text("location")}`,
    ]
      .filter(Boolean)
      .join("\n"),
    overview: text("conversation_summary") || text("target_audience"),
    goals: bullets(list(state["business_goals"])),
    solution: text("project_type"),
    pages: bullets(list(state["required_pages"])),
    features: bullets(list(state["required_features"])),
    integrations: bullets(list(state["required_integrations"])),
    design: text("design_direction"),
    package: text("recommended_plan"),
    requirements: bullets(list(state["additional_requirements"])),
    pricing: "",
    timeline: text("timeline") || text("estimated_timeline"),
    support: "30 days of post-launch support, bug fixes and guidance included.",
    "next-steps":
      "1. Confirm the scope and package.\n2. Approve the official quote.\n3. Pay the project deposit to reserve your build slot.\n4. Share content, logo and brand assets.\n5. Design & development begins.",
    contact:
      "PixelSpark · Mohammed\nWhatsApp: +234 708 158 0318\nEmail: pixelsparkx@gmail.com",
  };

  return STANDARD_SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    body: bodies[section.id] ?? "",
    enabled: true,
  })) satisfies ProposalSection[];
}

export function normalizeSections(raw: unknown, fallback: ProposalSection[]): ProposalSection[] {
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  return raw
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s, index) => ({
      id: String(s["id"] ?? `section-${index}`),
      title: String(s["title"] ?? "Section"),
      body: String(s["body"] ?? ""),
      enabled: s["enabled"] !== false,
      custom: s["custom"] === true,
    }));
}
