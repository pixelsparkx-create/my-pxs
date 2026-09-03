import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { computePlan, newReference, type EstimatorAnswers } from "./estimator";
import type { PlanRecord } from "./plan";

export const GOLDIE_HANDOFF_KEY = "pixelspark.goldie.handoff.v1";

/** Persists a generated plan and returns the canonical record used by the PDF + share UI. */
export async function createPlan(answers: EstimatorAnswers): Promise<PlanRecord> {
  const result = computePlan(answers);
  const reference = newReference();

  const row = {
    reference,
    goldie_session_id: getSessionId(),
    client_name: answers.client_name?.trim() || null,
    business_name: answers.business_name?.trim() || null,
    industry: answers.industry?.trim() || null,
    project_goal: answers.project_goal?.trim() || null,
    target_audience: answers.target_audience?.trim() || null,
    recommended_plan: result.recommended_plan,
    base_price: result.base_price,
    estimate_min: result.estimate_min,
    estimate_max: result.estimate_max,
    currency: result.currency,
    complexity_factors: result.complexity_factors as never,
    required_pages: (answers.pages ?? []) as never,
    required_features: (answers.features ?? []) as never,
    required_integrations: (answers.integrations ?? []) as never,
    design_direction: answers.design_direction ?? null,
    timeline: answers.timeline ?? null,
    rationale: result.rationale,
    answers: answers as never,
    status: "generated",
  };

  const { data, error } = await supabase.from("pricing_plans").insert(row).select("*").single();
  if (error) throw new Error(error.message);

  return {
    ...(data as unknown as PlanRecord),
    complexity_factors: result.complexity_factors,
    required_pages: answers.pages ?? [],
    required_features: answers.features ?? [],
    required_integrations: answers.integrations ?? [],
  };
}

export async function markPlanShared(reference: string) {
  try {
    await (supabase as never as { rpc: (n: string, a: unknown) => Promise<unknown> }).rpc("mark_plan_shared", {
      _reference: reference,
    });
  } catch {
    /* sharing should never fail the visitor */
  }
}

export async function submitPlan(input: {
  reference: string;
  client_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  note?: string | null;
}) {
  const { data, error } = await (supabase as never as {
    rpc: (n: string, a: unknown) => Promise<{ data: unknown; error: { message: string } | null }>;
  }).rpc("submit_plan", {
    _reference: input.reference,
    _client_name: input.client_name ?? null,
    _contact_email: input.contact_email ?? null,
    _contact_phone: input.contact_phone ?? null,
    _note: input.note ?? null,
  });
  if (error) throw new Error(error.message);
  const leadId = data as string;
  if (leadId) {
    const { rescoreLead } = await import("@/lib/leads/score");
    await rescoreLead(leadId).catch(() => null);
  }
  return leadId;
}

export async function fetchSharedPlan(reference: string): Promise<PlanRecord | null> {
  const { data, error } = await (supabase as never as {
    rpc: (n: string, a: unknown) => Promise<{ data: unknown; error: { message: string } | null }>;
  }).rpc("get_shared_plan", { _reference: reference });
  if (error || !data) return null;
  return data as PlanRecord;
}

/** Short, non-sensitive project context handed to Goldie so the client never repeats themselves. */
export function buildGoldieHandoff(plan: PlanRecord, answers: EstimatorAnswers) {
  const lines = [
    "I just completed the PixelSpark pricing guide. Here's my project so far:",
    plan.client_name ? `Name: ${plan.client_name}` : "",
    plan.business_name ? `Business: ${plan.business_name}` : "",
    plan.industry ? `Industry: ${plan.industry}` : "",
    plan.project_goal ? `Goal: ${plan.project_goal}` : "",
    answers.site_type ? `Website type: ${answers.site_type}` : "",
    plan.required_pages?.length ? `Pages: ${plan.required_pages.join(", ")}` : "",
    plan.required_features?.length ? `Features: ${plan.required_features.join(", ")}` : "",
    plan.required_integrations?.length ? `Integrations: ${plan.required_integrations.join(", ")}` : "",
    plan.design_direction ? `Design direction: ${plan.design_direction}` : "",
    plan.timeline ? `Timeline: ${plan.timeline}` : "",
    `Recommended package: ${plan.recommended_plan}`,
    `Estimated range: ₦${Number(plan.estimate_min).toLocaleString("en-NG")}–₦${Number(plan.estimate_max).toLocaleString("en-NG")}`,
    `Plan reference: ${plan.reference}`,
    "",
    "Please continue from here — don't ask me to repeat this.",
  ];
  return lines.filter(Boolean).join("\n");
}
