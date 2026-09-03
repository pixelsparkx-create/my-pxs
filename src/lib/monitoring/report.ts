import { supabase } from "@/integrations/supabase/client";

export type Severity = "info" | "warning" | "error" | "critical";

export type ErrorReport = {
  message: string;
  error?: unknown;
  severity?: Severity;
  /** Product area, e.g. "goldie", "proposals", "admin", "app". */
  feature?: string;
  /** Coarse grouping, e.g. "ai", "database", "network", "ui", "auth". */
  category?: string;
  /** Specific operation, e.g. "AI_RESPONSE", "PDF_GENERATION". */
  operation?: string;
  route?: string;
  context?: Record<string, unknown>;
  leadId?: string;
  proposalId?: string;
  goldieSessionId?: string;
};

const SENSITIVE_KEY = /(pass|token|secret|key|auth|credential|cookie|card|cvv|otp)/i;
const SENSITIVE_VALUE =
  /(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,})|(sb_[a-z]+_[A-Za-z0-9_-]{10,})|(Bearer\s+[A-Za-z0-9._-]{10,})|(sk-[A-Za-z0-9]{10,})/g;

/** Removes anything that looks like a credential before it ever leaves the browser. */
export function redact(value: string | undefined | null, max = 4000) {
  if (!value) return undefined;
  return value.replace(SENSITIVE_VALUE, "[redacted]").slice(0, max);
}

function redactContext(context?: Record<string, unknown>) {
  const safe: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(context ?? {})) {
    if (SENSITIVE_KEY.test(key)) continue;
    if (raw === null || raw === undefined) continue;
    if (typeof raw === "string") safe[key] = redact(raw, 500);
    else if (typeof raw === "number" || typeof raw === "boolean") safe[key] = raw;
    else safe[key] = redact(JSON.stringify(raw), 500);
  }
  return safe;
}

/** Strips ids, numbers and urls so repeats of the same failure share a fingerprint. */
function normalize(message: string) {
  return message
    .toLowerCase()
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, "<id>")
    .replace(/https?:\/\/\S+/g, "<url>")
    .replace(/\d+/g, "<n>")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function hash(input: string) {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}

export function fingerprintOf(parts: {
  feature?: string;
  operation?: string;
  route?: string;
  message: string;
  name?: string;
}) {
  const seed = [
    parts.feature ?? "app",
    parts.operation ?? "unknown",
    parts.route ?? "-",
    parts.name ?? "Error",
    normalize(parts.message),
  ].join("|");
  return `${parts.feature ?? "app"}:${parts.operation ?? "unknown"}:${hash(seed)}`;
}

function currentRoute() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.pathname}${window.location.search}`.slice(0, 300);
}

function environment() {
  if (typeof window === "undefined") return "server";
  const host = window.location.hostname;
  if (host === "localhost" || host.endsWith(".local")) return "development";
  if (host.includes("preview") || host.includes("-dev.")) return "preview";
  return "production";
}

const recentlySent = new Map<string, number>();
const THROTTLE_MS = 15_000;

/**
 * Records an error for the private admin System Health monitor.
 * Never throws — reporting must not break the user experience.
 */
export async function reportError(report: ErrorReport): Promise<string | null> {
  try {
    const err = report.error;
    const name = err instanceof Error ? err.name : undefined;
    const message =
      redact(report.message || (err instanceof Error ? err.message : String(err ?? "")), 2000) ??
      "Unknown error";
    const stack = err instanceof Error ? redact(err.stack, 8000) : undefined;
    const route = report.route ?? currentRoute();
    const fingerprint = fingerprintOf({
      feature: report.feature,
      operation: report.operation,
      route,
      message,
      name,
    });

    const now = Date.now();
    const last = recentlySent.get(fingerprint);
    if (last && now - last < THROTTLE_MS) return null;
    recentlySent.set(fingerprint, now);

    const { data, error } = await (supabase as never as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: string | null; error: unknown }>;
    }).rpc("log_error_event", {
      _fingerprint: fingerprint,
      _message: message,
      _severity: report.severity ?? "error",
      _feature: report.feature ?? "app",
      _category: report.category ?? "unknown",
      _environment: environment(),
      _side: "client",
      _route: route ?? null,
      _operation: report.operation ?? null,
      _stack: stack ?? null,
      _context: redactContext(report.context),
      _lead_id: report.leadId ?? null,
      _proposal_id: report.proposalId ?? null,
      _goldie_session_id: report.goldieSessionId ?? null,
    });

    if (error) return null;
    return data ?? null;
  } catch {
    return null;
  }
}

let installed = false;

/** Attaches global browser handlers once, so uncaught errors reach System Health. */
export function installErrorMonitoring() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    void reportError({
      message: event.message || "Uncaught error",
      error: event.error,
      feature: "app",
      category: "javascript",
      operation: "UNCAUGHT_ERROR",
      severity: "error",
      context: { source: event.filename, line: event.lineno, column: event.colno },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    void reportError({
      message: reason instanceof Error ? reason.message : String(reason ?? "Unhandled rejection"),
      error: reason,
      feature: "app",
      category: "javascript",
      operation: "UNHANDLED_REJECTION",
      severity: "error",
    });
  });
}
