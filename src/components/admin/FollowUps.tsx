import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, CheckCircle2, Loader2 } from "lucide-react";
import { reportError } from "@/lib/monitoring/report";

export type Followup = {
  id: string;
  lead_id: string;
  proposal_id: string | null;
  scheduled_at: string;
  followup_type: string;
  status: string;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
};

export type FollowupLead = {
  id: string;
  client_name: string | null;
  business_name: string | null;
  recommended_plan: string | null;
  estimated_range: string | null;
  status: string;
  contact_phone: string | null;
  contact_email: string | null;
};

export const FOLLOWUP_TYPES = ["check_in", "proposal_review", "quote_follow_up", "reminder"] as const;

export function presetDate(preset: string) {
  const d = new Date();
  if (preset === "tomorrow") d.setDate(d.getDate() + 1);
  if (preset === "3d") d.setDate(d.getDate() + 3);
  if (preset === "7d") d.setDate(d.getDate() + 7);
  if (preset === "14d") d.setDate(d.getDate() + 14);
  d.setHours(10, 0, 0, 0);
  return d;
}

export async function scheduleFollowup(input: {
  leadId: string;
  scheduledAt: Date;
  type?: string;
  notes?: string;
  proposalId?: string | null;
}) {
  const { error } = await supabase.from("lead_followups").insert({
    lead_id: input.leadId,
    proposal_id: input.proposalId ?? null,
    scheduled_at: input.scheduledAt.toISOString(),
    followup_type: input.type ?? "check_in",
    notes: input.notes ?? null,
    status: "scheduled",
  } as never);
  if (error) {
    void reportError({
      message: `Could not schedule follow-up: ${error.message}`,
      feature: "followups",
      category: "database",
      operation: "SCHEDULE_FOLLOWUP",
      severity: "error",
      leadId: input.leadId,
    });
    throw new Error(error.message);
  }
}

/** Cancels pending sales follow-ups when a lead is won or lost. */
export async function cancelPendingFollowups(leadId: string) {
  await supabase
    .from("lead_followups")
    .update({ status: "cancelled" } as never)
    .eq("lead_id", leadId)
    .in("status", ["scheduled", "due", "overdue"]);
}

function bucketOf(f: Followup) {
  if (f.status === "completed") return "completed";
  if (f.status === "cancelled") return "cancelled";
  const due = new Date(f.scheduled_at);
  const now = new Date();
  const sameDay = due.toDateString() === now.toDateString();
  if (due < now && !sameDay) return "overdue";
  if (sameDay) return "today";
  return "upcoming";
}

export function useFollowupSummary(followups: Followup[]) {
  return useMemo(() => {
    const today = followups.filter((f) => bucketOf(f) === "today").length;
    const overdue = followups.filter((f) => bucketOf(f) === "overdue").length;
    return { today, overdue };
  }, [followups]);
}

export function FollowUpsPanel({
  leads,
  onOpenLead,
}: {
  leads: FollowupLead[];
  onOpenLead?: (leadId: string) => void;
}) {
  const [rows, setRows] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [preset, setPreset] = useState("3d");
  const [custom, setCustom] = useState("");
  const [type, setType] = useState<string>("check_in");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lead_followups")
      .select("*")
      .order("scheduled_at", { ascending: true });
    setRows((data as unknown as Followup[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const leadById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);
  const grouped = useMemo(() => {
    const out: Record<string, Followup[]> = { today: [], overdue: [], upcoming: [], completed: [], cancelled: [] };
    for (const f of rows) out[bucketOf(f)]?.push(f);
    return out;
  }, [rows]);

  const suggestions = useMemo(() => {
    const withPending = new Set(
      rows.filter((f) => ["scheduled", "due", "overdue"].includes(f.status)).map((f) => f.lead_id),
    );
    return leads
      .filter((l) => !withPending.has(l.id))
      .filter((l) => ["quoted", "contacted", "reviewing"].includes(l.status))
      .slice(0, 4)
      .map((l) => ({
        lead: l,
        text:
          l.status === "quoted"
            ? "Proposal sent — consider following up in 2 days."
            : l.status === "contacted"
              ? "Client contacted — schedule another follow-up in 3 days."
              : "No response yet — a follow-up is recommended.",
        days: l.status === "quoted" ? 2 : 3,
      }));
  }, [leads, rows]);

  async function create() {
    if (!leadId) return;
    setCreating(true);
    try {
      const when = preset === "custom" && custom ? new Date(custom) : presetDate(preset);
      await scheduleFollowup({ leadId, scheduledAt: when, type, notes: notes.trim() || undefined });
      setNotes("");
      setLeadId("");
      await load();
    } catch {
      /* reported inside scheduleFollowup */
    } finally {
      setCreating(false);
    }
  }

  async function complete(id: string) {
    await supabase
      .from("lead_followups")
      .update({ status: "completed", completed_at: new Date().toISOString() } as never)
      .eq("id", id);
    await load();
  }

  async function reschedule(id: string, days: number) {
    const when = new Date();
    when.setDate(when.getDate() + days);
    when.setHours(10, 0, 0, 0);
    await supabase
      .from("lead_followups")
      .update({
        scheduled_at: when.toISOString(),
        status: "rescheduled",
        rescheduled_at: new Date().toISOString(),
      } as never)
      .eq("id", id);
    await load();
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const summary = { today: grouped["today"]?.length ?? 0, overdue: grouped["overdue"]?.length ?? 0 };

  return (
    <div className="space-y-6">
      {(summary.today > 0 || summary.overdue > 0) && (
        <div className="rounded-2xl border border-gold/50 bg-gold/5 px-5 py-4 text-sm flex items-center gap-3">
          <CalendarClock className="h-4 w-4 text-gold" />
          <span>
            {summary.today > 0 && `${summary.today} client follow-up${summary.today > 1 ? "s are" : " is"} due today`}
            {summary.today > 0 && summary.overdue > 0 && " · "}
            {summary.overdue > 0 && `${summary.overdue} overdue`}
          </span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="text-[11px] tracking-[0.15em] text-gold">SCHEDULE A FOLLOW-UP</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a lead…</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.business_name ?? l.client_name ?? l.id.slice(0, 8)}
              </option>
            ))}
          </select>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="tomorrow">Tomorrow</option>
            <option value="3d">In 3 days</option>
            <option value="7d">In 7 days</option>
            <option value="14d">In 14 days</option>
            <option value="custom">Custom date/time</option>
          </select>
          {preset === "custom" ? (
            <input
              type="datetime-local"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          ) : (
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              {FOLLOWUP_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => void create()}
            disabled={!leadId || creating}
            className="rounded-xl bg-gradient-gold text-ink font-semibold text-sm px-4 py-2 disabled:opacity-50"
          >
            {creating ? "Scheduling…" : "Schedule"}
          </button>
        </div>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Private note, e.g. Ask if they reviewed the Premium proposal."
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-[11px] tracking-[0.15em] text-gold mb-3">SUGGESTED FOLLOW-UPS</div>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <div key={s.lead.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  <strong>{s.lead.business_name ?? s.lead.client_name ?? "Lead"}</strong> — {s.text}
                </span>
                <button
                  onClick={async () => {
                    const when = new Date();
                    when.setDate(when.getDate() + s.days);
                    when.setHours(10, 0, 0, 0);
                    await scheduleFollowup({ leadId: s.lead.id, scheduledAt: when, type: "check_in" });
                    await load();
                  }}
                  className="text-xs rounded-full border border-border px-3 py-1.5 hover:border-gold hover:text-gold transition-colors"
                >
                  Schedule
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(["today", "overdue", "upcoming", "completed"] as const).map((bucket) => (
        <div key={bucket}>
          <div className="text-[11px] tracking-[0.15em] text-gold mb-3">{bucket.toUpperCase()}</div>
          {(grouped[bucket]?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing here.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {grouped[bucket]!.map((f) => {
                const lead = leadById.get(f.lead_id);
                return (
                  <div
                    key={f.id}
                    className={`rounded-2xl border bg-card p-5 ${bucket === "overdue" ? "border-destructive/50" : "border-border"}`}
                  >
                    <div className="font-semibold">
                      {bucket === "today" ? "🔥 " : ""}
                      {lead?.business_name ?? lead?.client_name ?? "Lead"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {lead?.recommended_plan ? `Proposal: ${lead.recommended_plan}` : "No package yet"}
                      {lead?.estimated_range ? ` · ${lead.estimated_range}` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Due: {new Date(f.scheduled_at).toLocaleString()} · {f.followup_type.replace(/_/g, " ")}
                    </div>
                    {f.notes && <div className="text-sm mt-2">{f.notes}</div>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {onOpenLead && (
                        <button
                          onClick={() => onOpenLead(f.lead_id)}
                          className="text-xs rounded-full border border-border px-3 py-1.5 hover:border-gold hover:text-gold transition-colors"
                        >
                          View lead
                        </button>
                      )}
                      {f.status !== "completed" && (
                        <>
                          <button
                            onClick={() => void complete(f.id)}
                            className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-3 py-1.5 hover:border-gold hover:text-gold transition-colors"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark complete
                          </button>
                          <button
                            onClick={() => void reschedule(f.id, 3)}
                            className="text-xs rounded-full border border-border px-3 py-1.5 hover:border-gold hover:text-gold transition-colors"
                          >
                            Reschedule +3d
                          </button>
                          <button
                            onClick={() => void reschedule(f.id, 7)}
                            className="text-xs rounded-full border border-border px-3 py-1.5 hover:border-gold hover:text-gold transition-colors"
                          >
                            +7d
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
