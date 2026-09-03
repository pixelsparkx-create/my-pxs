import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_NUMBER, EMAIL_ADDRESS, LINKEDIN_URL } from "@/lib/contact";
import { Loader2, MessageCircle, Mail, Linkedin, Trash2, Inbox as InboxIcon } from "lucide-react";

type ContactEvent = {
  id: string;
  source: string;
  kind: string;
  title: string;
  message: string | null;
  client_name: string | null;
  business_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  project: string | null;
  recommended_plan: string | null;
  status: string;
  priority: string;
  lead_id: string | null;
  plan_id: string | null;
  goldie_session_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const STATUSES = ["new", "reviewing", "responded", "closed"] as const;
const SOURCES = ["all", "goldie", "pricing_guide", "contact_form", "whatsapp", "email", "linkedin"] as const;

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function InboxPanel() {
  const [events, setEvents] = useState<ContactEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<(typeof SOURCES)[number]>("all");
  const [status, setStatus] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contact_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    setEvents((data as unknown as ContactEvent[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () =>
      events.filter(
        (e) => (source === "all" || e.source === source) && (status === "all" || e.status === status),
      ),
    [events, source, status],
  );

  async function setEventStatus(id: string, next: string) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: next } : e)));
    await supabase.from("contact_events").update({ status: next }).eq("id", id);
  }

  async function remove(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await supabase.from("contact_events").delete().eq("id", id);
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const newCount = events.filter((e) => e.status === "new").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-gold font-semibold">
          <InboxIcon className="h-4 w-4" /> UNIFIED INBOX
        </div>
        <span className="text-xs text-muted-foreground">
          {newCount} new · {events.length} total
        </span>
        <div className="ml-auto flex gap-2">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as (typeof SOURCES)[number])}
            className="rounded-full border border-border bg-background px-3 py-2 text-xs"
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All sources" : s.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-full border border-border bg-background px-3 py-2 text-xs"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 && <p className="text-sm text-muted-foreground">No contact activity yet.</p>}

      <div className="space-y-3">
        {filtered.map((e) => {
          const open = openId === e.id;
          const who = e.client_name || e.business_name || e.contact_email || e.contact_phone || "Anonymous visitor";
          return (
            <div key={e.id} className="rounded-2xl border border-border bg-card p-5">
              <button onClick={() => setOpenId(open ? null : e.id)} className="w-full text-left">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{e.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {who} · {e.source.replace("_", " ")} · {e.kind} · {when(e.created_at)}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      e.status === "new" ? "bg-gradient-gold text-ink" : "border border-border text-muted-foreground"
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
              </button>

              {open && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  {e.message && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{e.message}</p>}
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    {e.contact_email && (
                      <div>
                        <dt className="text-muted-foreground inline">Email: </dt>
                        <dd className="inline">{e.contact_email}</dd>
                      </div>
                    )}
                    {e.contact_phone && (
                      <div>
                        <dt className="text-muted-foreground inline">Phone: </dt>
                        <dd className="inline">{e.contact_phone}</dd>
                      </div>
                    )}
                    {e.recommended_plan && (
                      <div>
                        <dt className="text-muted-foreground inline">Plan: </dt>
                        <dd className="inline">{e.recommended_plan}</dd>
                      </div>
                    )}
                    {e.project && (
                      <div>
                        <dt className="text-muted-foreground inline">Project: </dt>
                        <dd className="inline">{e.project}</dd>
                      </div>
                    )}
                    {e.goldie_session_id && (
                      <div>
                        <dt className="text-muted-foreground inline">Session: </dt>
                        <dd className="inline">{e.goldie_session_id}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://wa.me/${(e.contact_phone || `+${WHATSAPP_NUMBER}`).replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                    <a
                      href={`mailto:${e.contact_email || EMAIL_ADDRESS}?subject=${encodeURIComponent("PixelSpark — " + e.title)}`}
                      className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" /> Email
                    </a>
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 hover:border-gold hover:text-gold transition-colors"
                    >
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                    <select
                      value={e.status}
                      onChange={(ev) => void setEventStatus(e.id, ev.target.value)}
                      className="rounded-full border border-border bg-background px-3 py-2 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => void remove(e.id)}
                      className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border px-4 py-2 text-destructive hover:border-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
