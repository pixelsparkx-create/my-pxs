import { supabase } from "@/integrations/supabase/client";

export type LeadCategory = "HOT" | "WARM" | "COLD";

export type ScoredLead = {
  id: string;
  lead_score: number | null;
  score_category: string | null;
  score_reasons: string[] | null;
  score_signals: Record<string, unknown> | null;
  score_override: string | null;
  score_override_by: string | null;
  score_override_reason: string | null;
  score_override_at: string | null;
  score_updated_at: string | null;
};

export type ScoreHistoryEntry = {
  id: string;
  lead_id: string;
  previous_score: number | null;
  new_score: number;
  previous_category: string | null;
  new_category: string;
  reason: string | null;
  source: string;
  created_at: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = (name: string, args: Record<string, unknown>) => (supabase as any).rpc(name, args);

export function effectiveCategory(lead: Partial<ScoredLead>): LeadCategory {
  const value = (lead.score_override || lead.score_category || "COLD").toUpperCase();
  return value === "HOT" || value === "WARM" ? (value as LeadCategory) : "COLD";
}

export function categoryClasses(category: LeadCategory): string {
  switch (category) {
    case "HOT":
      return "bg-gradient-gold text-ink border-transparent";
    case "WARM":
      return "border-gold/60 text-gold";
    default:
      return "border-border text-muted-foreground";
  }
}

/** Recalculate a lead's score from its real activity (estimator, proposals, contact). */
export async function rescoreLead(leadId: string) {
  const { data, error } = await rpc("score_lead", { _lead_id: leadId });
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    score: Number(row.score ?? 0),
    category: String(row.category ?? "COLD") as LeadCategory,
    reasons: (row.reasons ?? []) as string[],
  };
}

export async function overrideLeadCategory(leadId: string, category: LeadCategory, reason: string) {
  const { error } = await rpc("override_lead_category", {
    _lead_id: leadId,
    _category: category,
    _reason: reason || null,
  });
  return !error;
}

export async function fetchScoreHistory(leadId: string): Promise<ScoreHistoryEntry[]> {
  const { data } = await supabase
    .from("lead_score_history" as never)
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data as unknown as ScoreHistoryEntry[]) ?? [];
}
