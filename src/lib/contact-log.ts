import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";

export type ContactSource = "goldie" | "contact_form" | "whatsapp" | "email" | "linkedin" | "pricing_guide";

/**
 * Logs contact activity to the unified inbox.
 * `kind` must be honest: "initiated" for outbound clicks (WhatsApp/email/LinkedIn buttons),
 * "received" only when PixelSpark actually receives the content of the message.
 */
export async function logContactEvent(input: {
  source: ContactSource;
  kind: "initiated" | "received";
  title: string;
  message?: string | null;
  client_name?: string | null;
  business_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  project?: string | null;
  recommended_plan?: string | null;
  lead_id?: string | null;
  plan_id?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabase.from("contact_events").insert({
      source: input.source,
      kind: input.kind,
      title: input.title,
      message: input.message ?? null,
      client_name: input.client_name ?? null,
      business_name: input.business_name ?? null,
      contact_email: input.contact_email ?? null,
      contact_phone: input.contact_phone ?? null,
      project: input.project ?? null,
      recommended_plan: input.recommended_plan ?? null,
      lead_id: input.lead_id ?? null,
      plan_id: input.plan_id ?? null,
      goldie_session_id: getSessionId(),
      metadata: (input.metadata ?? {}) as never,
    });
  } catch {
    /* activity logging must never block the visitor */
  }
}
