export type PlanName = "Starter" | "Growth" | "Premium";

export type EstimatorAnswers = {
  client_name?: string;
  business_name?: string;
  industry?: string;
  project_goal?: string;
  target_audience?: string;
  site_type?: string;
  pages?: string[];
  features?: string[];
  integrations?: string[];
  design_direction?: string;
  timeline?: string;
};

export type ComplexityFactor = { title: string; body: string; cost: number };

export type PlanResult = {
  recommended_plan: PlanName;
  base_price: number;
  estimate_min: number;
  estimate_max: number;
  currency: "NGN";
  complexity_factors: ComplexityFactor[];
  rationale: string;
};

export const PACKAGES: Record<PlanName, { price: number; sub: string; includes: string[] }> = {
  Starter: {
    price: 25000,
    sub: "1-Page Landing Site",
    includes: [
      "1-page landing website",
      "Mobile responsive design",
      "Professional custom layout",
      "Contact form + WhatsApp integration",
      "Basic SEO & performance optimization",
      "Website deployment",
    ],
  },
  Growth: {
    price: 60000,
    sub: "Business Website",
    includes: [
      "Up to 5 pages",
      "Custom design & professional UI/UX",
      "Booking / request forms",
      "On-page SEO + Google Maps",
      "Modern animations and interactions",
      "Website deployment",
      "1 month support",
    ],
  },
  Premium: {
    price: 100000,
    sub: "Complete Digital Solution",
    includes: [
      "Unlimited standard informational pages",
      "Completely custom UI/UX",
      "Web app / dashboard functionality",
      "Database, payments & API integrations",
      "Advanced SEO & performance optimization",
      "Priority delivery",
      "3 months support",
    ],
  },
};

export const SITE_TYPES = [
  "One-page landing site",
  "Multi-page business website",
  "Booking / reservation website",
  "E-commerce store",
  "Web app / dashboard",
  "Not sure yet",
];

export const PAGE_OPTIONS = [
  "Home",
  "About",
  "Services",
  "Portfolio / Gallery",
  "Pricing",
  "Blog",
  "Menu / Catalogue",
  "Booking",
  "Contact",
  "FAQ",
];

export const FEATURE_OPTIONS: { label: string; cost: number; body: string }[] = [
  { label: "Contact form", cost: 0, body: "Standard enquiry form — included in every package." },
  { label: "WhatsApp chat", cost: 0, body: "Included in every package." },
  { label: "Booking / reservation system", cost: 25000, body: "Real-time availability, reservations, automated confirmations and booking management." },
  { label: "Online payments", cost: 25000, body: "Flutterwave, Paystack or Stripe checkout, plus provider transaction fees." },
  { label: "Customer accounts / login", cost: 25000, body: "Registration, profiles, order or booking history." },
  { label: "Admin dashboard", cost: 35000, body: "A custom system for managing bookings, customers, products, orders or content." },
  { label: "AI chatbot / assistant", cost: 30000, body: "AI chat or recommendations. Ongoing AI usage is billed by the provider." },
  { label: "Blog / content manager", cost: 15000, body: "Publish and manage articles without a developer." },
  { label: "E-commerce (products & cart)", cost: 40000, body: "Product catalogue, cart, checkout and order management." },
  { label: "Advanced animations / 3D", cost: 20000, body: "Highly customized motion, interactive or 3D experiences." },
  { label: "Multi-language", cost: 15000, body: "Content delivered in more than one language." },
];

export const INTEGRATION_OPTIONS: { label: string; cost: number; body: string }[] = [
  { label: "Google Maps", cost: 0, body: "Included from Growth upwards." },
  { label: "Email automation", cost: 12000, body: "Automated confirmations, notifications and campaigns." },
  { label: "CRM / external API", cost: 18000, body: "Connecting your website to external business systems." },
  { label: "Analytics & tracking", cost: 0, body: "Included in every package." },
  { label: "Social media feeds", cost: 8000, body: "Live feeds pulled from your social accounts." },
  { label: "SMS notifications", cost: 12000, body: "Provider usage fees are billed separately." },
];

export const DESIGN_DIRECTIONS = ["Premium & minimal", "Bold & colourful", "Luxury / editorial", "Clean corporate", "Playful & modern", "Match my existing brand"];

export const TIMELINES = ["ASAP (within 1 week)", "2–3 weeks", "1 month", "Flexible"];

const PREMIUM_FEATURES = new Set([
  "Customer accounts / login",
  "Admin dashboard",
  "AI chatbot / assistant",
  "E-commerce (products & cart)",
]);

function naira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export function formatRange(min: number, max: number) {
  return `${naira(min)}–${naira(max)}`;
}

export function computePlan(answers: EstimatorAnswers): PlanResult {
  const features = answers.features ?? [];
  const integrations = answers.integrations ?? [];
  const pages = answers.pages ?? [];

  const wantsPremium =
    features.some((f) => PREMIUM_FEATURES.has(f)) ||
    answers.site_type === "Web app / dashboard" ||
    answers.site_type === "E-commerce store";

  const isLanding = answers.site_type === "One-page landing site" && pages.length <= 2 && features.every((f) => ["Contact form", "WhatsApp chat"].includes(f));

  const recommended: PlanName = wantsPremium ? "Premium" : isLanding ? "Starter" : "Growth";
  const base = PACKAGES[recommended].price;

  const factors: ComplexityFactor[] = [];

  for (const f of features) {
    const opt = FEATURE_OPTIONS.find((o) => o.label === f);
    if (!opt || opt.cost === 0) continue;
    // Premium already bundles core app functionality at a discount.
    const cost = recommended === "Premium" ? Math.round(opt.cost * 0.5) : opt.cost;
    factors.push({ title: f, body: opt.body, cost });
  }

  for (const i of integrations) {
    const opt = INTEGRATION_OPTIONS.find((o) => o.label === i);
    if (!opt || opt.cost === 0) continue;
    factors.push({ title: i, body: opt.body, cost: opt.cost });
  }

  const includedPages = recommended === "Starter" ? 1 : recommended === "Growth" ? 5 : 99;
  if (pages.length > includedPages) {
    const extra = pages.length - includedPages;
    factors.push({
      title: `${extra} additional page${extra > 1 ? "s" : ""}`,
      body: `Your package includes ${includedPages} page${includedPages > 1 ? "s" : ""}. Extra pages are designed and built individually.`,
      cost: extra * 8000,
    });
  }

  if (answers.timeline === "ASAP (within 1 week)") {
    factors.push({ title: "Priority delivery", body: "Compressed timelines require dedicated scheduling.", cost: Math.round(base * 0.15) });
  }

  const addOns = factors.reduce((sum, f) => sum + f.cost, 0);
  const min = base + addOns;
  const max = Math.round((min + Math.max(base * 0.2, addOns * 0.25)) / 1000) * 1000;

  const reasons: string[] = [];
  if (pages.length > 1) reasons.push(`your project needs ${pages.length} pages`);
  if (answers.design_direction) reasons.push("a custom design direction");
  const paidFeatures = features.filter((f) => (FEATURE_OPTIONS.find((o) => o.label === f)?.cost ?? 0) > 0);
  if (paidFeatures.length) reasons.push(paidFeatures.slice(0, 3).join(", ").toLowerCase());

  const rationale =
    `Based on your requirements, ${recommended} is recommended because ` +
    (reasons.length ? reasons.join(", ") + "." : "it matches the scope you described.") +
    (recommended === "Premium"
      ? " Premium covers custom application functionality that goes beyond a standard informational website."
      : recommended === "Growth"
        ? " Growth is the right fit for a complete business website rather than a simple landing page."
        : " Starter gives you a strong, professional online introduction without paying for pages you don't need.");

  return {
    recommended_plan: recommended,
    base_price: base,
    estimate_min: min,
    estimate_max: max,
    currency: "NGN",
    complexity_factors: factors,
    rationale,
  };
}

export function newReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return `PXS-${out}`;
}
