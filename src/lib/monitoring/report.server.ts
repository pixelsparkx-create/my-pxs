import { createClient } from "@supabase/supabase-js";
import { fingerprintOf, redact, type Severity } from "./report";

type ServerReport = {
  message: string;
  error?: unknown;
  severity?: Severity;
  feature?: string;
  category?: string;
  operation?: string;
  route?: string;
  context?: Record<string, unknown>;
  leadId?: string;
  proposalId?: string;
  goldieSessionId?: string;
};

/** Records a server-side failure privately. Never throws. */
export async function reportServerError(report: ServerReport) {
  try {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
    if (!url || !key) return;

    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const err = report.error;
    const message =
      redact(report.message || (err instanceof Error ? err.message : String(err ?? "")), 2000) ??
      "Unknown server error";
    const stack = err instanceof Error ? redact(err.stack, 8000) : undefined;
    const fingerprint = fingerprintOf({
      feature: report.feature,
      operation: report.operation,
      route: report.route,
      message,
      name: err instanceof Error ? err.name : undefined,
    });

    await client.rpc("log_error_event", {
      _fingerprint: fingerprint,
      _message: message,
      _severity: report.severity ?? "error",
      _feature: report.feature ?? "server",
      _category: report.category ?? "unknown",
      _environment: process.env["NODE_ENV"] === "development" ? "development" : "production",
      _side: "server",
      _route: report.route ?? null,
      _operation: report.operation ?? null,
      _stack: stack ?? null,
      _context: report.context ?? {},
      _lead_id: report.leadId ?? null,
      _proposal_id: report.proposalId ?? null,
      _goldie_session_id: report.goldieSessionId ?? null,
    } as never);
  } catch {
    // Monitoring must never break a request.
  }
}
