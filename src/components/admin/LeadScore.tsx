import { useState } from "react";
import {
  categoryClasses,
  effectiveCategory,
  fetchScoreHistory,
  overrideLeadCategory,
  rescoreLead,
  type LeadCategory,
  type ScoreHistoryEntry,
  type ScoredLead,
} from "@/lib/leads/score";
import { Loader2, RefreshCw, History, Flame } from "lucide-react";

const CATEGORIES: LeadCategory[] = ["HOT", "WARM", "COLD"];

export function ScoreBadge({ lead }: { lead: Partial<ScoredLead> }) {
  const category = effectiveCategory(lead);
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryClasses(category)}`}
      title={lead.score_override ? "Manually overridden by an admin" : "Automatically scored"}
    >
      <Flame className="h-3 w-3" />
      {category} · {lead.lead_score ?? 0}
      {lead.score_override ? " ·  manual" : ""}
    </span>
  );
}

/** "Why this score" + rescore / override / history controls for one lead. */
export function ScorePanel({
  lead,
  onChange,
}: {
  lead: ScoredLead;
  onChange: (patch: Partial<ScoredLead>) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<ScoreHistoryEntry[] | null>(null);
  const [overriding, setOverriding] = useState(false);
  const [category, setCategory] = useState<LeadCategory>(effectiveCategory(lead));
  const [reason, setReason] = useState("");

  const reasons = Array.isArray(lead.score_reasons) ? lead.score_reasons : [];

  async function doRescore() {
    setBusy(true);
    const result = await rescoreLead(lead.id);
    setBusy(false);
    if (!result) return;
    onChange({
      lead_score: result.score,
      score_category: result.category,
      score_reasons: result.reasons,
      score_updated_at: new Date().toISOString(),
    });
    if (history) setHistory(await fetchScoreHistory(lead.id));
  }

  async function saveOverride() {
    setBusy(true);
    const ok = await overrideLeadCategory(lead.id, category, reason);
    setBusy(false);
    if (!ok) return;
    onChange({ score_override: category, score_override_reason: reason || null });
    setOverriding(false);
    setReason("");
    if (history) setHistory(await fetchScoreHistory(lead.id));
  }

  async function toggleHistory() {
    if (history) return setHistory(null);
    setBusy(true);
    setHistory(await fetchScoreHistory(lead.id));
    setBusy(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-background/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-[11px] tracking-[0.15em] text-gold">WHY THIS SCORE</div>
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => void doRescore()}
            className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-3 py-1.5 hover:border-gold hover:text-gold transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Rescore
          </button>
          <button
            onClick={() => setOverriding((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-3 py-1.5 hover:border-gold hover:text-gold transition-colors"
          >
            Override
          </button>
          <button
            onClick={() => void toggleHistory()}
            className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-3 py-1.5 hover:border-gold hover:text-gold transition-colors"
          >
            <History className="h-3.5 w-3.5" /> History
          </button>
        </div>
      </div>

      {reasons.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {reasons.map((r, i) => (
            <li key={i}>· {r}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Not scored yet — press Rescore to evaluate this lead from its real activity.
        </p>
      )}

      {lead.score_override && (
        <p className="mt-3 text-xs text-gold">
          Manual override: {lead.score_override}
          {lead.score_override_reason ? ` — ${lead.score_override_reason}` : ""}
          {lead.score_override_by ? ` (${lead.score_override_by})` : ""}
        </p>
      )}

      {overriding && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as LeadCategory)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (recorded in history)"
            className="flex-1 min-w-[180px] rounded-full border border-border bg-background px-4 py-1.5 text-xs outline-none focus:border-gold"
          />
          <button
            onClick={() => void saveOverride()}
            className="rounded-full bg-gradient-gold text-ink px-4 py-1.5 text-xs font-semibold"
          >
            Save
          </button>
        </div>
      )}

      {history && (
        <div className="mt-4 border-t border-border pt-3 space-y-1.5">
          {history.length === 0 && <p className="text-xs text-muted-foreground">No scoring history yet.</p>}
          {history.map((h) => (
            <div key={h.id} className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">
                {h.previous_category ?? "—"} → {h.new_category}
              </span>{" "}
              ({h.previous_score ?? 0} → {h.new_score}) · {h.source}
              {h.reason ? ` · ${h.reason}` : ""} · {new Date(h.created_at).toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
