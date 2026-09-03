import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_NUMBER, EMAIL_ADDRESS } from "@/lib/contact";

export type GoldieBrief = {
  client_name?: string;
  contact_email?: string;
  contact_phone?: string;
  business_name?: string;
  business_type?: string;
  location?: string;
  target_audience?: string;
  business_goals?: string[];
  existing_website?: string;
  project_type?: string;
  required_pages?: string[];
  required_features?: string[];
  required_integrations?: string[];
  design_direction?: string;
  content_available?: string;
  timeline?: string;
  budget?: string;
  recommended_plan?: string;
  estimated_range?: string;
  estimated_timeline?: string;
  complexity?: string;
  additional_requirements?: string[];
  conversation_summary?: string;
  proposal_markdown?: string;
  ready_for_review?: boolean;
};

const LIST_KEYS = [
  "business_goals",
  "required_pages",
  "required_features",
  "required_integrations",
  "additional_requirements",
] as const;

export function mergeBrief(current: GoldieBrief, incoming: Partial<GoldieBrief>): GoldieBrief {
  const next: GoldieBrief = { ...current };
  for (const [key, value] of Object.entries(incoming)) {
    if (value === null || value === undefined || value === "") continue;
    if ((LIST_KEYS as readonly string[]).includes(key) && Array.isArray(value)) {
      const previous = (current[key as keyof GoldieBrief] as string[] | undefined) ?? [];
      const merged = Array.from(new Set([...previous, ...value.map(String)]));
      (next as Record<string, unknown>)[key] = merged;
      continue;
    }
    (next as Record<string, unknown>)[key] = value;
  }
  return next;
}

export function briefFieldCount(brief: GoldieBrief) {
  return Object.entries(brief).filter(
    ([key, value]) =>
      key !== "ready_for_review" &&
      value !== undefined &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0),
  ).length;
}

export const STORAGE_KEY = "pixelspark.goldie.session.v1";

export function labelOf(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Markdown", "");
}

export function briefToText(brief: GoldieBrief) {
  const lines: string[] = [];
  const push = (label: string, value?: string | string[]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return;
    lines.push(`${label}: ${Array.isArray(value) ? value.join(", ") : value}`);
  };
  push("Name", brief.client_name);
  push("Business", brief.business_name);
  push("Business type", brief.business_type);
  push("Location", brief.location);
  push("Project type", brief.project_type);
  push("Goals", brief.business_goals);
  push("Pages", brief.required_pages);
  push("Features", brief.required_features);
  push("Integrations", brief.required_integrations);
  push("Design direction", brief.design_direction);
  push("Timeline", brief.timeline);
  push("Recommended plan", brief.recommended_plan);
  push("Estimated range", brief.estimated_range);
  return lines.join("\n");
}

export function goldieWhatsAppMessage(brief: GoldieBrief) {
  return `Hello Mohammed 👋

I just used Goldie on the PixelSpark website and here's my project:

${briefToText(brief)}

I'd like to discuss the next steps.`;
}

export function goldieWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function goldieEmailLink(brief: GoldieBrief) {
  const subject = encodeURIComponent(
    `Project brief${brief.business_name ? ` — ${brief.business_name}` : ""} (via Goldie)`,
  );
  const body = encodeURIComponent(goldieWhatsAppMessage(brief));
  return `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${body}`;
}

export async function submitBrief(brief: GoldieBrief) {
  const { data, error } = await supabase
    .from("goldie_leads")
    .insert({
      client_name: brief.client_name ?? null,
      contact_email: brief.contact_email ?? null,
      contact_phone: brief.contact_phone ?? null,
      business_name: brief.business_name ?? null,
      business_type: brief.business_type ?? null,
      location: brief.location ?? null,
      project_type: brief.project_type ?? null,
      recommended_plan: brief.recommended_plan ?? null,
      estimated_range: brief.estimated_range ?? null,
      timeline: brief.timeline ?? brief.estimated_timeline ?? null,
      project_state: brief as never,
      conversation_summary: brief.conversation_summary ?? null,
      proposal_markdown: brief.proposal_markdown ?? null,
      status: "new",
      priority: brief.complexity?.toLowerCase().includes("high") ? "high" : "normal",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Score the lead from its real signals as soon as it lands.
  if (data?.id) {
    const { rescoreLead } = await import("@/lib/leads/score");
    await rescoreLead(data.id as string).catch(() => null);
  }
}

