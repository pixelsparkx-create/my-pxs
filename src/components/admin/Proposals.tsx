import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowDown, ArrowUp, Eye, FileText, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { reportError } from "@/lib/monitoring/report";
import {
  CUSTOM_SECTION_IDEAS,
  PROPOSAL_STATUSES,
  PROPOSAL_TEMPLATES,
  defaultSections,
  normalizeSections,
  type Proposal,
  type ProposalSection,
  type ProposalVersion,
} from "@/lib/proposals/schema";
import { buildProposalDocument, exportProposalPdf } from "@/lib/proposals/render";

export type ProposalLead = {
  id: string;
  client_name: string | null;
  business_name: string | null;
  project_type: string | null;
  recommended_plan: string | null;
  estimated_range: string | null;
  timeline: string | null;
  conversation_summary: string | null;
  project_state: Record<string, unknown> | null;
};

function toProposal(row: Record<string, unknown>): Proposal {
  return {
    ...(row as unknown as Proposal),
    sections: normalizeSections(row["sections"], defaultSections()),
  };
}

export function ProposalsPanel({ leads }: { leads: ProposalLead[] }) {
  const [rows, setRows] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingFor, setCreatingFor] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("proposals").select("*").order("updated_at", { ascending: false });
    setRows(((data as unknown as Record<string, unknown>[]) ?? []).map(toProposal));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createFromLead(leadId: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const state = (lead.project_state ?? {}) as Record<string, unknown>;
    const sections = defaultSections(state, {
      client_name: lead.client_name ?? "",
      business_name: lead.business_name ?? "",
      conversation_summary: lead.conversation_summary ?? "",
      recommended_plan: lead.recommended_plan ?? "",
      timeline: lead.timeline ?? "",
    });

    const { data, error } = await (supabase as never as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: string | null; error: { message: string } | null }>;
    }).rpc("create_draft_proposal", {
      _lead_id: leadId,
      _title: `${lead.business_name ?? lead.client_name ?? "Project"} Proposal`,
      _client_name: lead.client_name ?? lead.business_name ?? "",
      _project_name: lead.project_type ?? "Website project",
      _description: lead.conversation_summary ?? "",
      _recommended_plan: lead.recommended_plan ?? "",
      _estimated_range: lead.estimated_range ?? "",
      _timeline: lead.timeline ?? "",
      _sections: sections,
    });

    if (error || !data) {
      void reportError({
        message: `Could not create proposal: ${error?.message ?? "unknown"}`,
        feature: "proposals",
        category: "database",
        operation: "PROPOSAL_GENERATION",
        severity: "error",
        leadId,
      });
      toast.error("Couldn't create that proposal. Please try again.");
      return;
    }
    await load();
    setEditingId(data);
    setCreatingFor("");
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const editing = rows.find((r) => r.id === editingId);
  if (editing) {
    return (
      <ProposalEditor
        proposal={editing}
        onClose={() => setEditingId(null)}
        onSaved={async () => {
          await load();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 flex flex-wrap items-center gap-2">
        <select
          value={creatingFor}
          onChange={(e) => setCreatingFor(e.target.value)}
          className="flex-1 min-w-[220px] rounded-xl border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Create a proposal from a lead…</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.business_name ?? l.client_name ?? l.id.slice(0, 8)}
            </option>
          ))}
        </select>
        <button
          onClick={() => void createFromLead(creatingFor)}
          disabled={!creatingFor}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-gold text-ink font-semibold text-sm px-4 py-2 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> New proposal
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No proposals yet. Create one from a Goldie lead above.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] tracking-[0.15em] text-gold">{p.reference}</div>
                  <div className="font-semibold mt-1 truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {p.client_name ?? "—"} · v{p.version} · {p.status.toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {p.official_quote ? `Official quote: ${p.official_quote}` : `Estimate: ${p.estimated_range ?? "—"}`}
                  </div>
                </div>
                <FileText className="h-5 w-5 text-gold shrink-0" strokeWidth={1.5} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setEditingId(p.id)}
                  className="text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (!exportProposalPdf(p)) {
                      toast.error("Allow pop-ups to export this proposal as a PDF.");
                      void reportError({
                        message: "Proposal PDF export blocked by pop-up blocker",
                        feature: "proposals",
                        category: "ui",
                        operation: "PDF_GENERATION",
                        severity: "warning",
                        proposalId: p.id,
                      });
                    }
                  }}
                  className="text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                >
                  Export PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProposalEditor({
  proposal,
  onClose,
  onSaved,
}: {
  proposal: Proposal;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<Proposal>(proposal);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [changeSummary, setChangeSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<ProposalVersion[]>([]);
  const [newSection, setNewSection] = useState("");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("proposal_versions")
        .select("*")
        .eq("proposal_id", proposal.id)
        .order("version", { ascending: false });
      setVersions((data as unknown as ProposalVersion[]) ?? []);
    })();
  }, [proposal.id]);

  const set = <K extends keyof Proposal>(key: K, value: Proposal[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setSection = (index: number, patch: Partial<ProposalSection>) =>
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));

  const move = (index: number, delta: number) =>
    setDraft((d) => {
      const next = [...d.sections];
      const target = index + delta;
      if (target < 0 || target >= next.length) return d;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item!);
      return { ...d, sections: next };
    });

  const previewHtml = useMemo(() => buildProposalDocument(draft), [draft]);

  async function save() {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const nextVersion = draft.version + 1;

      const { error } = await supabase
        .from("proposals")
        .update({
          title: draft.title,
          subtitle: draft.subtitle,
          client_name: draft.client_name,
          project_name: draft.project_name,
          description: draft.description,
          template: draft.template,
          accent_color: draft.accent_color,
          secondary_color: draft.secondary_color,
          logo_url: draft.logo_url,
          sections: draft.sections as never,
          recommended_plan: draft.recommended_plan,
          estimated_range: draft.estimated_range,
          official_quote: draft.official_quote,
          timeline: draft.timeline,
          support_period: draft.support_period,
          notes: draft.notes,
          terms: draft.terms,
          status: draft.status,
          version: nextVersion,
        } as never)
        .eq("id", draft.id);
      if (error) throw new Error(error.message);

      await supabase.from("proposal_versions").insert({
        proposal_id: draft.id,
        version: nextVersion,
        snapshot: draft as never,
        previous_pricing: proposal.official_quote ?? proposal.estimated_range,
        new_pricing: draft.official_quote ?? draft.estimated_range,
        change_summary: changeSummary.trim() || null,
        editor_email: userData.user?.email ?? null,
      } as never);

      setDraft((d) => ({ ...d, version: nextVersion }));
      setChangeSummary("");
      toast.success(`Saved as version ${nextVersion}`);
      await onSaved();
    } catch (e) {
      void reportError({
        message: e instanceof Error ? e.message : "Could not save proposal",
        error: e,
        feature: "proposals",
        category: "database",
        operation: "PROPOSAL_SAVE",
        severity: "error",
        proposalId: draft.id,
      });
      toast.error("Couldn't save this proposal version.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onClose}
          className="text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
        >
          ← All proposals
        </button>
        <span className="text-[11px] tracking-[0.15em] text-gold">{draft.reference} · v{draft.version}</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
            className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
          >
            <Eye className="h-3.5 w-3.5" /> {mode === "edit" ? "Preview" : "Edit"}
          </button>
          <button
            onClick={() => {
              if (!exportProposalPdf(draft)) toast.error("Allow pop-ups to export this proposal as a PDF.");
            }}
            className="text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold text-ink font-semibold text-xs px-4 py-2 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save version"}
          </button>
        </div>
      </div>

      {mode === "preview" ? (
        <iframe
          title="Proposal preview"
          srcDoc={previewHtml}
          className="w-full h-[70vh] rounded-2xl border border-border bg-white"
        />
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="text-[11px] tracking-[0.15em] text-gold">PROPOSAL DETAILS</div>
              <Field label="Title" value={draft.title} onChange={(v) => set("title", v)} />
              <Field label="Subtitle" value={draft.subtitle ?? ""} onChange={(v) => set("subtitle", v)} />
              <Field label="Client name" value={draft.client_name ?? ""} onChange={(v) => set("client_name", v)} />
              <Field label="Project name" value={draft.project_name ?? ""} onChange={(v) => set("project_name", v)} />
              <Field label="Description" value={draft.description ?? ""} onChange={(v) => set("description", v)} multiline />
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Recommended package" value={draft.recommended_plan ?? ""} onChange={(v) => set("recommended_plan", v)} />
                <Field label="Timeline" value={draft.timeline ?? ""} onChange={(v) => set("timeline", v)} />
                <Field label="Support period" value={draft.support_period ?? ""} onChange={(v) => set("support_period", v)} />
                <label className="block">
                  <span className="text-[11px] tracking-[0.15em] text-muted-foreground">STATUS</span>
                  <select
                    value={draft.status}
                    onChange={(e) => set("status", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    {PROPOSAL_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <Field label="Notes" value={draft.notes ?? ""} onChange={(v) => set("notes", v)} multiline />
              <Field label="Terms / disclaimers" value={draft.terms ?? ""} onChange={(v) => set("terms", v)} multiline />
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="text-[11px] tracking-[0.15em] text-gold">PRICING</div>
              <Field
                label="Goldie estimate (not the official quote)"
                value={draft.estimated_range ?? ""}
                onChange={(v) => set("estimated_range", v)}
              />
              <Field
                label="Official PixelSpark quote"
                value={draft.official_quote ?? ""}
                onChange={(v) => set("official_quote", v)}
              />
              {!draft.official_quote && draft.estimated_range && (
                <button
                  onClick={() => set("official_quote", draft.estimated_range?.split("–")[0]?.trim() ?? "")}
                  className="text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                >
                  Convert estimate into an official quote
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="text-[11px] tracking-[0.15em] text-gold">BRANDING & TEMPLATE</div>
              <div className="grid sm:grid-cols-3 gap-2">
                {PROPOSAL_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      set("template", t.id);
                      set("accent_color", t.accent);
                      set("secondary_color", t.secondary);
                    }}
                    className={`rounded-xl border p-3 text-left text-xs transition-colors ${
                      draft.template === t.id ? "border-gold text-gold" : "border-border hover:border-gold/60"
                    }`}
                  >
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-muted-foreground mt-1">{t.description}</div>
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <label className="block">
                  <span className="text-[11px] tracking-[0.15em] text-muted-foreground">ACCENT</span>
                  <input
                    type="color"
                    value={draft.accent_color}
                    onChange={(e) => set("accent_color", e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-background"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] tracking-[0.15em] text-muted-foreground">SECONDARY</span>
                  <input
                    type="color"
                    value={draft.secondary_color}
                    onChange={(e) => set("secondary_color", e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-background"
                  />
                </label>
                <Field label="Logo URL" value={draft.logo_url ?? ""} onChange={(v) => set("logo_url", v)} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="text-[11px] tracking-[0.15em] text-gold">SECTIONS</div>
              {draft.sections.map((section, index) => (
                <div key={`${section.id}-${index}`} className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={section.title}
                      onChange={(e) => setSection(index, { title: e.target.value })}
                      className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-gold"
                    />
                    <button onClick={() => move(index, -1)} className="p-1.5 text-muted-foreground hover:text-gold" aria-label="Move up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => move(index, 1)} className="p-1.5 text-muted-foreground hover:text-gold" aria-label="Move down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <label className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={(e) => setSection(index, { enabled: e.target.checked })}
                      />
                      show
                    </label>
                    {section.custom && (
                      <button
                        onClick={() =>
                          setDraft((d) => ({ ...d, sections: d.sections.filter((_, i) => i !== index) }))
                        }
                        className="p-1.5 text-muted-foreground hover:text-destructive"
                        aria-label="Delete section"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={section.body}
                    onChange={(e) => setSection(index, { body: e.target.value })}
                    rows={3}
                    placeholder="Section content. Start a line with - for bullet points."
                    className="mt-2 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-gold"
                  />
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <input
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  list="section-ideas"
                  placeholder="New section title"
                  className="flex-1 min-w-[180px] rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <datalist id="section-ideas">
                  {CUSTOM_SECTION_IDEAS.map((i) => (
                    <option key={i} value={i} />
                  ))}
                </datalist>
                <button
                  onClick={() => {
                    if (!newSection.trim()) return;
                    setDraft((d) => ({
                      ...d,
                      sections: [
                        ...d.sections,
                        {
                          id: `custom-${Date.now()}`,
                          title: newSection.trim(),
                          body: "",
                          enabled: true,
                          custom: true,
                        },
                      ],
                    }));
                    setNewSection("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add section
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="text-[11px] tracking-[0.15em] text-gold">VERSION HISTORY</div>
              <input
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="What changed in this version? e.g. Added online payment integration."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
              />
              {versions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved versions yet.</p>
              ) : (
                <div className="space-y-2 text-xs text-muted-foreground">
                  {versions.map((v) => (
                    <div key={v.id} className="border-t border-border pt-2">
                      <div className="text-foreground font-medium">
                        v{v.version} · {new Date(v.created_at).toLocaleString()}
                      </div>
                      <div>{v.change_summary ?? "No summary"}</div>
                      <div>
                        {v.previous_pricing ?? "—"} → {v.new_pricing ?? "—"}
                        {v.editor_email ? ` · ${v.editor_email}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      )}
    </label>
  );
}
