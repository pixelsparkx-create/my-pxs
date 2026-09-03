import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Bug, CheckCircle2, Loader2, RefreshCw, ShieldAlert } from "lucide-react";

type ErrorEvent = {
  id: string;
  fingerprint: string;
  severity: string;
  status: string;
  feature: string;
  category: string;
  environment: string;
  side: string;
  route: string | null;
  operation: string | null;
  message: string;
  stack: string | null;
  context: Record<string, unknown> | null;
  lead_id: string | null;
  proposal_id: string | null;
  goldie_session_id: string | null;
  occurrences: number;
  first_seen: string;
  last_seen: string;
  admin_notes: string | null;
};

type Occurrence = { id: string; route: string | null; created_at: string };

const STATUSES = ["open", "investigating", "resolved", "ignored"] as const;

const severityStyle: Record<string, string> = {
  info: "border-border text-muted-foreground",
  warning: "border-gold/60 text-gold",
  error: "border-destructive/60 text-destructive",
  critical: "border-destructive bg-destructive/10 text-destructive",
};

export function SystemHealth() {
  const [rows, setRows] = useState<ErrorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [filter, setFilter] = useState<string>("unresolved");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("error_events")
      .select("*")
      .order("last_seen", { ascending: false })
      .limit(200);
    setRows((data as unknown as ErrorEvent[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetails = useCallback(async (id: string) => {
    setOpenId((current) => (current === id ? null : id));
    const { data } = await supabase
      .from("error_occurrences")
      .select("id, route, created_at")
      .eq("error_id", id)
      .order("created_at", { ascending: false })
      .limit(10);
    setOccurrences((data as unknown as Occurrence[]) ?? []);
  }, []);

  async function update(id: string, patch: Partial<ErrorEvent>) {
    const payload: Record<string, unknown> = { ...patch };
    if (patch.status === "resolved") payload["resolved_at"] = new Date().toISOString();
    if (patch.status && patch.status !== "resolved") payload["resolved_at"] = null;
    await supabase.from("error_events").update(payload as never).eq("id", id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 86_400_000;
    const sum = (list: ErrorEvent[]) => list.reduce((n, r) => n + r.occurrences, 0);
    return {
      total: sum(rows),
      critical: rows.filter((r) => r.severity === "critical").length,
      unresolved: rows.filter((r) => r.status === "open" || r.status === "investigating").length,
      today: rows.filter((r) => now - new Date(r.last_seen).getTime() < day).length,
      week: rows.filter((r) => now - new Date(r.last_seen).getTime() < day * 7).length,
      features: Array.from(new Set(rows.map((r) => r.feature))),
    };
  }, [rows]);

  const visible = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "unresolved") return rows.filter((r) => r.status === "open" || r.status === "investigating");
    if (filter === "critical") return rows.filter((r) => r.severity === "critical");
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const frequent = useMemo(() => [...rows].sort((a, b) => b.occurrences - a.occurrences).slice(0, 5), [rows]);

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Metric label="Total occurrences" value={stats.total} icon={Bug} />
        <Metric label="Critical issues" value={stats.critical} icon={ShieldAlert} tone="danger" />
        <Metric label="Unresolved" value={stats.unresolved} icon={AlertTriangle} />
        <Metric label="Active today" value={stats.today} icon={RefreshCw} />
        <Metric label="Active this week" value={stats.week} icon={RefreshCw} />
        <Metric label="Affected features" value={stats.features.length} icon={CheckCircle2} />
      </div>

      {stats.features.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.features.map((f) => (
            <span key={f} className="text-[11px] uppercase tracking-wider rounded-full border border-border px-3 py-1 text-muted-foreground">
              {f}
            </span>
          ))}
        </div>
      )}

      {frequent.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-[11px] tracking-[0.15em] text-gold mb-3">MOST FREQUENT</div>
          <div className="space-y-2">
            {frequent.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{r.message}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{r.occurrences}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {["unresolved", "critical", "open", "investigating", "resolved", "ignored", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11px] uppercase tracking-wider rounded-full px-3 py-1.5 border transition-colors ${
              filter === f ? "border-gold text-gold" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => void load()}
          className="ml-auto inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">No errors recorded for this filter. Everything looks healthy.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityStyle[r.severity] ?? severityStyle["error"]}`}>
                      {r.severity}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {r.feature}{r.operation ? ` · ${r.operation}` : ""} · {r.side}
                    </span>
                  </div>
                  <div className="mt-1.5 font-medium break-words">{r.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Occurrences: {r.occurrences} · last {new Date(r.last_seen).toLocaleString()}
                    {r.route ? ` · ${r.route}` : ""}
                  </div>
                </div>
                <select
                  value={r.status}
                  onChange={(e) => void update(r.id, { status: e.target.value })}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs uppercase tracking-wider"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => void openDetails(r.id)}
                  className="text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                >
                  {openId === r.id ? "Hide details" : "View details"}
                </button>
                {r.status !== "resolved" ? (
                  <button
                    onClick={() => void update(r.id, { status: "resolved" })}
                    className="text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                  >
                    Mark resolved
                  </button>
                ) : (
                  <button
                    onClick={() => void update(r.id, { status: "open" })}
                    className="text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                  >
                    Reopen
                  </button>
                )}
              </div>

              {openId === r.id && (
                <div className="mt-4 border-t border-border pt-4 space-y-3 text-sm">
                  <Row label="Category" value={r.category} />
                  <Row label="Environment" value={r.environment} />
                  <Row label="First seen" value={new Date(r.first_seen).toLocaleString()} />
                  <Row label="Last seen" value={new Date(r.last_seen).toLocaleString()} />
                  <Row label="Fingerprint" value={r.fingerprint} />
                  {r.goldie_session_id && <Row label="Goldie session" value={r.goldie_session_id} />}
                  {r.lead_id && <Row label="Lead" value={r.lead_id} />}
                  {r.proposal_id && <Row label="Proposal" value={r.proposal_id} />}
                  {r.context && Object.keys(r.context).length > 0 && (
                    <div>
                      <div className="text-[11px] tracking-[0.15em] text-gold">CONTEXT</div>
                      <pre className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
                        {JSON.stringify(r.context, null, 2)}
                      </pre>
                    </div>
                  )}
                  {r.stack && (
                    <div>
                      <div className="text-[11px] tracking-[0.15em] text-gold">STACK TRACE</div>
                      <pre className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {r.stack}
                      </pre>
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] tracking-[0.15em] text-gold">RECENT OCCURRENCES</div>
                    <div className="mt-1 text-xs text-muted-foreground space-y-1">
                      {occurrences.length === 0 && <div>—</div>}
                      {occurrences.map((o) => (
                        <div key={o.id}>
                          {new Date(o.created_at).toLocaleString()} {o.route ? `· ${o.route}` : ""}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] tracking-[0.15em] text-gold mb-1">PRIVATE ADMIN NOTES</div>
                    <textarea
                      defaultValue={r.admin_notes ?? ""}
                      onBlur={(e) => void update(r.id, { admin_notes: e.target.value })}
                      rows={2}
                      placeholder="e.g. Fixed AI request timeout in Goldie proposal generation."
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone?: "danger";
}) {
  return (
    <div className={`rounded-2xl border bg-card p-5 ${tone === "danger" && value > 0 ? "border-destructive/60" : "border-border"}`}>
      <Icon className={`h-5 w-5 mb-3 ${tone === "danger" && value > 0 ? "text-destructive" : "text-gold"}`} strokeWidth={1.5} />
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="text-muted-foreground w-32 shrink-0 uppercase tracking-wider">{label}</span>
      <span className="break-all">{value}</span>
    </div>
  );
}
