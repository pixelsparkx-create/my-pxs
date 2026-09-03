import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/auth-google";
import { projects } from "@/lib/projects";
import { downloadProposal } from "@/lib/goldie/proposal";
import type { GoldieBrief } from "@/lib/goldie/brief";
import { formatCount } from "@/lib/engagement";
import { SystemHealth } from "@/components/admin/SystemHealth";
import { FollowUpsPanel } from "@/components/admin/FollowUps";
import { ProposalsPanel } from "@/components/admin/Proposals";
import { PaymentsPanel } from "@/components/admin/Payments";
import { InboxPanel } from "@/components/admin/Inbox";
import { ScoreBadge, ScorePanel } from "@/components/admin/LeadScore";
import { effectiveCategory, type ScoredLead } from "@/lib/leads/score";
import {
  Heart,
  Eye,
  ExternalLink,
  LayoutDashboard,
  MessageSquareQuote,
  BarChart3,
  FolderKanban,
  LogOut,
  Loader2,
  Check,
  X,
  Lock,
  ShieldCheck,
  Sparkles,
  Inbox,
  ChevronDown,
  CalendarClock,
  FileText,
  Receipt,
  Activity,
  Mails,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — PixelSpark" },
      { name: "description", content: "Private PixelSpark administration area." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin — PixelSpark" },
      { property: "og:description", content: "Private PixelSpark administration area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Testimonial = {
  id: string;
  full_name: string;
  display_name: string;
  title: string;
  rating: number;
  message: string;
  approved: boolean;
  created_at: string;
};

type Engagement = { project_id: string; appreciations: number; views: number; live_visits: number };

type Lead = {
  id: string;
  client_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  business_name: string | null;
  business_type: string | null;
  location: string | null;
  project_type: string | null;
  recommended_plan: string | null;
  estimated_range: string | null;
  timeline: string | null;
  project_state: Record<string, unknown> | null;
  conversation_summary: string | null;
  proposal_markdown: string | null;
  priority: string;
  status: string;
  created_at: string;
} & ScoredLead;

const LEAD_STATUSES = ["new", "reviewing", "contacted", "quoted", "in progress", "closed"] as const;

type Status = "loading" | "signed-out" | "unauthorized" | "admin";

function AdminPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return setStatus("signed-out");
    const { data: ok } = await (supabase as any).rpc("is_admin");
    setStatus(ok === true ? "admin" : "unauthorized");
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    setStatus("loading");
    void check();
  }

  async function signOut() {
    await supabase.auth.signOut();
    setStatus("signed-out");
  }

  async function onGoogle() {
    setError(null);
    const result = await signInWithGoogle(`${window.location.origin}/admin`);
    if (result.error) return setError(String((result.error as any).message ?? result.error));
    if (result.redirected) return;
    setStatus("loading");
    void check();
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </main>
    );
  }

  if (status !== "admin") {
    return (
      <main className="min-h-screen grid place-items-center px-6 py-16 bg-gradient-ink">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-card p-8">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-gold">
            <Lock className="h-3.5 w-3.5" /> PIXELSPARK ADMIN
          </div>
          <h1 className="mt-2 text-2xl font-bold">Private access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {status === "unauthorized"
              ? "This account is not authorized for the PixelSpark admin area."
              : "Sign in with your authorized administrator account."}
          </p>

          {status === "unauthorized" ? (
            <button
              onClick={signOut}
              className="mt-6 w-full rounded-full border border-border px-5 py-3 font-semibold hover:border-gold hover:text-gold transition-colors"
            >
              Sign out
            </button>
          ) : (
            <form onSubmit={onSignIn} className="mt-6 space-y-3">
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
              />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                disabled={busy}
                className="w-full rounded-full bg-gradient-gold text-ink px-5 py-3 font-semibold shadow-gold disabled:opacity-60"
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <div className="my-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>
              <button
                type="button"
                onClick={onGoogle}
                className="w-full rounded-full border border-border px-5 py-3 font-semibold hover:border-gold hover:text-gold transition-colors"
              >
                Continue with Google
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return <AdminDashboard onSignOut={signOut} />;
}

const modules = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "leads", label: "AI Leads", icon: Inbox },
  { id: "inbox", label: "Inbox", icon: Mails },
  { id: "followups", label: "Follow-Ups", icon: CalendarClock },
  { id: "proposals", label: "Proposals", icon: FileText },
  { id: "payments", label: "Payments", icon: Receipt },
  { id: "portfolio", label: "Portfolio", icon: FolderKanban },
  { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "health", label: "System Health", icon: Activity },
] as const;

type ModuleId = (typeof modules)[number]["id"];

function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<ModuleId>("overview");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [engagement, setEngagement] = useState<Engagement[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [signals, setSignals] = useState<{ source: string; kind: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const slugs = useMemo(() => projects.map((p) => p.slug), []);

  const load = useCallback(async () => {
    setLoading(true);
    const [t, e, l, c] = await Promise.all([
      supabase.from("testimonials").select("*").order("created_at", { ascending: false }),
      (supabase as any).rpc("get_project_engagement", { _project_ids: slugs }),
      supabase.from("goldie_leads").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_events").select("source,kind").limit(1000),
    ]);
    setTestimonials((t.data as Testimonial[]) ?? []);
    setEngagement((e.data as Engagement[]) ?? []);
    setLeads((l.data as unknown as Lead[]) ?? []);
    setSignals((c.data as unknown as { source: string; kind: string }[]) ?? []);
    setLoading(false);
  }, [slugs]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = engagement.reduce(
    (acc, r) => ({
      appreciations: acc.appreciations + Number(r.appreciations ?? 0),
      views: acc.views + Number(r.views ?? 0),
      live: acc.live + Number(r.live_visits ?? 0),
    }),
    { appreciations: 0, views: 0, live: 0 },
  );

  async function setApproved(id: string, approved: boolean) {
    await supabase.from("testimonials").update({ approved }).eq("id", id);
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, approved } : t)));
  }

  async function remove(id: string) {
    await supabase.from("testimonials").delete().eq("id", id);
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  }

  async function setLeadStatus(id: string, status: string) {
    await supabase.from("goldie_leads").update({ status }).eq("id", id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  function patchLead(id: string, patch: Partial<Lead>) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  async function deleteLead(id: string) {
    await supabase.from("goldie_leads").delete().eq("id", id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  const engagementBySlug = new Map(engagement.map((e) => [e.project_id, e]));

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold tracking-tight">
            <Sparkles className="h-5 w-5 text-gold" strokeWidth={1.5} />
            PIXELSPARK <span className="text-gold">ADMIN</span>
          </div>
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-2 text-sm rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
          >
            Sign out <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
        <nav className="flex lg:flex-col gap-2 overflow-x-auto">
          {modules.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                tab === id
                  ? "bg-gradient-gold text-ink shadow-gold"
                  : "border border-border hover:border-gold/60 hover:text-gold"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>

        <section>
          {loading ? (
            <div className="grid place-items-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : tab === "overview" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Stat label="Portfolio Projects" value={String(projects.length)} icon={FolderKanban} />
              <Stat
                label="Testimonials"
                value={`${testimonials.filter((t) => t.approved).length} / ${testimonials.length}`}
                hint="approved / total"
                icon={MessageSquareQuote}
              />
              <Stat label="Project Appreciations" value={formatCount(totals.appreciations)} icon={Heart} />
              <Stat label="Project Views" value={formatCount(totals.views)} icon={Eye} />
              <Stat label="Live Project Visits" value={formatCount(totals.live)} icon={ExternalLink} />
              <Stat
                label="Pending Review"
                value={String(testimonials.filter((t) => !t.approved).length)}
                icon={ShieldCheck}
              />
              <Stat
                label="Goldie Leads"
                value={`${leads.filter((l) => l.status === "new").length} / ${leads.length}`}
                hint="new / total"
                icon={Inbox}
              />
            </div>
          ) : tab === "leads" ? (
            <LeadsPanel leads={leads} onStatus={setLeadStatus} onDelete={deleteLead} onPatch={patchLead} />
          ) : tab === "inbox" ? (
            <InboxPanel />
          ) : tab === "followups" ? (
            <FollowUpsPanel leads={leads} />
          ) : tab === "proposals" ? (
            <ProposalsPanel leads={leads} />
          ) : tab === "payments" ? (
            <PaymentsPanel />
          ) : tab === "health" ? (
            <SystemHealth />
          ) : tab === "portfolio" ? (
            <div className="grid md:grid-cols-2 gap-5">
              {projects.map((p) => {
                const e = engagementBySlug.get(p.slug);
                return (
                  <div key={p.slug} className="rounded-2xl border border-border bg-card p-5 hover:border-gold/60 transition-colors">
                    <div className="text-xs tracking-[0.15em] text-gold">{p.category?.toUpperCase?.() ?? ""}</div>
                    <div className="font-semibold mt-1">{p.title}</div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-gold" /> {formatCount(Number(e?.appreciations ?? 0))}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-gold" /> {formatCount(Number(e?.views ?? 0))}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ExternalLink className="h-3.5 w-3.5 text-gold" /> {formatCount(Number(e?.live_visits ?? 0))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : tab === "testimonials" ? (
            <div className="space-y-4">
              {testimonials.length === 0 && (
                <p className="text-sm text-muted-foreground">No testimonial submissions yet.</p>
              )}
              {testimonials.map((t) => (
                <div key={t.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                      <div className="font-semibold">
                        {t.display_name}{" "}
                        <span className="text-xs text-muted-foreground font-normal">({t.full_name})</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.title} · {"★".repeat(t.rating)} · {new Date(t.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        t.approved ? "bg-gradient-gold text-ink" : "border border-border text-muted-foreground"
                      }`}
                    >
                      {t.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{t.message}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setApproved(t.id, !t.approved)}
                      className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                    >
                      {t.approved ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                      {t.approved ? "Unapprove" : "Approve"}
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 text-destructive hover:border-destructive transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
            <LeadQuality leads={leads} signals={signals} />
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="text-xs tracking-[0.2em] text-gold mb-4">PORTFOLIO ENGAGEMENT</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="py-2 pr-4">Project</th>
                      <th className="py-2 pr-4">Appreciations</th>
                      <th className="py-2 pr-4">Views</th>
                      <th className="py-2">Live visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => {
                      const e = engagementBySlug.get(p.slug);
                      return (
                        <tr key={p.slug} className="border-t border-border">
                          <td className="py-3 pr-4 font-medium">{p.title}</td>
                          <td className="py-3 pr-4">{formatCount(Number(e?.appreciations ?? 0))}</td>
                          <td className="py-3 pr-4">{formatCount(Number(e?.views ?? 0))}</td>
                          <td className="py-3">{formatCount(Number(e?.live_visits ?? 0))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 hover:border-gold/60 hover:shadow-gold transition-all duration-500">
      <Icon className="h-5 w-5 text-gold mb-4" strokeWidth={1.5} />
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
      {hint && <div className="text-xs text-muted-foreground/70">{hint}</div>}
    </div>
  );
}

function LeadsPanel({
  leads,
  onStatus,
  onDelete,
  onPatch,
}: {
  leads: Lead[];
  onStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onPatch: (id: string, patch: Partial<Lead>) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (filter !== "all" && lead.status !== filter) return false;
      if (!q) return true;
      return [
        lead.client_name,
        lead.business_name,
        lead.business_type,
        lead.location,
        lead.project_type,
        lead.contact_email,
        lead.contact_phone,
        lead.recommended_plan,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [leads, query, filter]);

  if (leads.length === 0) {
    return <p className="text-sm text-muted-foreground">No AI project briefs yet. Goldie will collect them here.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search leads by name, business, contact…"
          className="flex-1 min-w-[220px] rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-gold"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-full border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider"
        >
          <option value="all">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">
          {visible.length} of {leads.length}
        </span>
      </div>

      {visible.length === 0 && <p className="text-sm text-muted-foreground">No leads match this filter.</p>}

      {visible.map((lead) => {

        const state = (lead.project_state ?? {}) as Record<string, unknown>;
        const open = openId === lead.id;
        const list = (key: string) => (Array.isArray(state[key]) ? (state[key] as string[]) : []);
        return (
          <div key={lead.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start gap-3 justify-between">
              <div className="min-w-0">
                <div className="font-semibold">
                  {lead.business_name ?? lead.client_name ?? "Unnamed project"}{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    #{lead.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {[lead.client_name, lead.business_type, lead.location, lead.project_type]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {[lead.contact_email, lead.contact_phone].filter(Boolean).join(" · ") || "No contact details given"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ScoreBadge lead={lead} />
                {lead.priority === "high" && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-gold text-gold">
                    High
                  </span>
                )}
                <select
                  value={lead.status}
                  onChange={(e) => onStatus(lead.id, e.target.value)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs uppercase tracking-wider"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Plan: <strong className="text-foreground">{lead.recommended_plan ?? "—"}</strong></span>
              <span>Estimate: <strong className="text-foreground">{lead.estimated_range ?? "—"}</strong></span>
              <span>Timeline: <strong className="text-foreground">{lead.timeline ?? "—"}</strong></span>
              <span>{new Date(lead.created_at).toLocaleString()}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setOpenId(open ? null : lead.id)}
                className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
              >
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                {open ? "Hide details" : "View brief"}
              </button>
              {lead.contact_phone && (
                <a
                  href={`https://wa.me/${lead.contact_phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                >
                  WhatsApp
                </a>
              )}
              {lead.contact_email && (
                <a
                  href={`mailto:${lead.contact_email}`}
                  className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                >
                  Email
                </a>
              )}
              <button
                onClick={() => {
                  const ok = downloadProposal({
                    ...(state as GoldieBrief),
                    business_name: lead.business_name ?? undefined,
                    client_name: lead.client_name ?? undefined,
                    recommended_plan: lead.recommended_plan ?? undefined,
                    estimated_range: lead.estimated_range ?? undefined,
                    timeline: lead.timeline ?? undefined,
                    proposal_markdown: lead.proposal_markdown ?? undefined,
                    conversation_summary: lead.conversation_summary ?? undefined,
                  });
                  if (!ok) alert("Allow pop-ups to export this proposal as a PDF.");
                }}
                className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
              >
                Export PDF
              </button>
              <button

                onClick={() => onDelete(lead.id)}
                className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 text-destructive hover:border-destructive transition-colors"
              >
                Delete
              </button>
            </div>

            {open && (
              <div className="mt-5 space-y-5 border-t border-border pt-5 text-sm">
                <ScorePanel lead={lead} onChange={(patch) => onPatch(lead.id, patch)} />
                <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <Detail label="Business summary" value={(state["target_audience"] as string) ?? "—"} />
                  <Detail label="Goals" value={list("business_goals").join(", ") || "—"} />
                  <Detail label="Pages" value={list("required_pages").join(", ") || "—"} />
                  <Detail label="Features" value={list("required_features").join(", ") || "—"} />
                  <Detail label="Integrations" value={list("required_integrations").join(", ") || "—"} />
                  <Detail label="Design direction" value={(state["design_direction"] as string) ?? "—"} />
                  <Detail label="Complexity" value={(state["complexity"] as string) ?? "—"} />
                  <Detail label="Budget" value={(state["budget"] as string) ?? "—"} />
                </div>
                <div className="space-y-3">
                  <Detail label="Conversation summary" value={lead.conversation_summary ?? "—"} />
                  {lead.proposal_markdown && (
                    <div>
                      <div className="text-[11px] tracking-[0.15em] text-gold">PROPOSAL</div>
                      <pre className="mt-1 whitespace-pre-wrap font-sans text-sm text-muted-foreground max-h-80 overflow-y-auto">
                        {lead.proposal_markdown}
                      </pre>
                    </div>
                  )}
                </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] tracking-[0.15em] text-gold">{label.toUpperCase()}</div>
      <div className="text-sm text-muted-foreground">{value}</div>
    </div>
  );
}


function LeadQuality({ leads, signals }: { leads: Lead[]; signals: { source: string; kind: string }[] }) {
  const scored = leads.filter((l) => typeof l.lead_score === "number");
  const avg = scored.length
    ? Math.round(scored.reduce((sum, l) => sum + Number(l.lead_score ?? 0), 0) / scored.length)
    : 0;
  const counts = { HOT: 0, WARM: 0, COLD: 0 } as Record<string, number>;
  leads.forEach((l) => {
    counts[effectiveCategory(l)] += 1;
  });
  const initiated = signals.filter((s) => s.kind === "initiated");
  const bySource = (source: string) => initiated.filter((s) => s.source === source).length;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <Stat label="Average lead score" value={String(avg)} hint={`${scored.length} scored leads`} icon={BarChart3} />
      <Stat label="Hot leads" value={String(counts.HOT)} hint={`${counts.WARM} warm · ${counts.COLD} cold`} icon={Inbox} />
      <Stat label="WhatsApp handoffs" value={String(bySource("whatsapp"))} hint="conversion signal" icon={Mails} />
      <Stat label="Email handoffs" value={String(bySource("email"))} hint="conversion signal" icon={Mails} />
    </div>
  );
}
