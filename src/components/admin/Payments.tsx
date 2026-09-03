import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CURRENCIES,
  PAYMENT_STATUSES,
  PAYMENT_TYPES,
  formatMoney,
  paymentEmailLink,
  paymentTypeLabel,
  paymentUrl,
  paymentWhatsAppLink,
  type PaymentRequest,
  type PaymentStatus,
} from "@/lib/payments/shared";
import {
  Loader2,
  Plus,
  Copy,
  Mail,
  MessageCircle,
  Ban,
  CheckCircle2,
  Receipt,
  Search,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold transition-colors";

export function PaymentsPanel() {
  const [rows, setRows] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payment_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as unknown as PaymentRequest[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return [r.request_code, r.client_name, r.project_name, r.client_email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, query, statusFilter]);

  const totals = useMemo(() => {
    const paid = rows.filter((r) => r.status === "paid");
    const pending = rows.filter((r) => r.status === "pending");
    return {
      paid: paid.reduce((sum, r) => sum + Number(r.amount ?? 0), 0),
      pending: pending.reduce((sum, r) => sum + Number(r.amount ?? 0), 0),
      paidCount: paid.length,
      pendingCount: pending.length,
    };
  }, [rows]);

  async function createRequest(form: HTMLFormElement) {
    const fd = new FormData(form);
    const amount = Number(fd.get("amount"));
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSaving(true);
    const { data: codeData, error: codeError } = await (supabase as any).rpc("generate_payment_code");
    if (codeError) {
      setSaving(false);
      toast.error("Could not generate a payment code");
      return;
    }
    const expiresDays = Number(fd.get("expires_days") || 0);
    const { error } = await supabase.from("payment_requests").insert({
      request_code: String(codeData),
      client_name: String(fd.get("client_name") || "") || null,
      client_email: String(fd.get("client_email") || "") || null,
      client_phone: String(fd.get("client_phone") || "") || null,
      project_name: String(fd.get("project_name") || "") || null,
      project_type: String(fd.get("project_type") || "") || null,
      payment_type: String(fd.get("payment_type") || "full"),
      amount,
      currency: String(fd.get("currency") || "NGN"),
      description: String(fd.get("description") || "") || null,
      internal_note: String(fd.get("internal_note") || "") || null,
      expires_at: expiresDays > 0 ? new Date(Date.now() + expiresDays * 86400000).toISOString() : null,
    } as never);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Payment request ${codeData} created`);
    form.reset();
    setCreating(false);
    void load();
  }

  async function setStatus(row: PaymentRequest, status: PaymentStatus) {
    const { error } = await supabase
      .from("payment_requests")
      .update({ status, paid_at: status === "paid" ? new Date().toISOString() : null } as never)
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
    toast.success(`Marked ${row.request_code} as ${status}`);
  }

  function copyLink(row: PaymentRequest) {
    void navigator.clipboard.writeText(paymentUrl(row.request_code));
    toast.success("Payment link copied");
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <MiniStat label="Collected" value={formatMoney(totals.paid)} hint={`${totals.paidCount} paid`} />
        <MiniStat label="Awaiting payment" value={formatMoney(totals.pending)} hint={`${totals.pendingCount} pending`} />
        <MiniStat label="Total requests" value={String(rows.length)} hint="all time" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code, client or project"
            className={`${inputClass} pl-10`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | PaymentStatus)}
          className={`${inputClass} w-auto`}
        >
          <option value="all">All statuses</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-gold text-ink font-medium px-5 py-2.5 text-sm shadow-gold"
        >
          <Plus className="h-4 w-4" /> New request
        </button>
      </div>

      {creating && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void createRequest(e.currentTarget);
          }}
          className="rounded-2xl border border-border bg-card p-6 grid sm:grid-cols-2 gap-4"
        >
          <Field label="Client name"><input name="client_name" className={inputClass} /></Field>
          <Field label="Client email"><input name="client_email" type="email" className={inputClass} /></Field>
          <Field label="Client phone (WhatsApp)"><input name="client_phone" className={inputClass} /></Field>
          <Field label="Project name"><input name="project_name" className={inputClass} /></Field>
          <Field label="Project type"><input name="project_type" placeholder="Website, App…" className={inputClass} /></Field>
          <Field label="Payment type">
            <select name="payment_type" className={inputClass} defaultValue="full">
              {PAYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Amount"><input name="amount" type="number" min="1" step="0.01" required className={inputClass} /></Field>
          <Field label="Currency">
            <select name="currency" className={inputClass} defaultValue="NGN">
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Expires in (days)"><input name="expires_days" type="number" min="0" defaultValue={7} className={inputClass} /></Field>
          <Field label="Internal note"><input name="internal_note" className={inputClass} /></Field>
          <div className="sm:col-span-2">
            <Field label="Client-facing description">
              <textarea name="description" rows={3} className={inputClass} />
            </Field>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={() => setCreating(false)} className="rounded-full border border-border px-5 py-2.5 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-gold text-ink font-medium px-5 py-2.5 text-sm shadow-gold disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create request
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          <Receipt className="h-6 w-6 text-gold mx-auto mb-3" />
          No payment requests yet.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((row) => (
            <div key={row.id} className="rounded-2xl border border-border bg-card p-5 hover:border-gold/60 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs tracking-[0.15em] text-gold">{row.request_code}</div>
                  <div className="font-semibold mt-1">{row.project_name ?? "Untitled project"}</div>
                  <div className="text-sm text-muted-foreground">
                    {row.client_name ?? "Unnamed client"} · {paymentTypeLabel(row.payment_type)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl">{formatMoney(row.amount, row.currency)}</div>
                  <StatusPill status={row.status} />
                </div>
              </div>

              {row.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{row.description}</p>}

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Action onClick={() => copyLink(row)} icon={Copy}>Copy link</Action>
                <a
                  href={paymentWhatsAppLink(row)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 hover:border-gold hover:text-gold transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
                <a
                  href={paymentEmailLink(row)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 hover:border-gold hover:text-gold transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
                {row.status === "pending" && (
                  <>
                    <Action onClick={() => void setStatus(row, "paid")} icon={CheckCircle2}>Mark paid</Action>
                    <Action onClick={() => void setStatus(row, "cancelled")} icon={Ban}>Cancel</Action>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Action({
  onClick,
  icon: Icon,
  children,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 hover:border-gold hover:text-gold transition-colors"
    >
      <Icon className="h-3.5 w-3.5" /> {children}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "paid"
      ? "border-gold/50 text-gold bg-gold/10"
      : status === "pending"
        ? "border-border text-muted-foreground"
        : "border-destructive/40 text-destructive bg-destructive/10";
  return (
    <span className={`mt-1 inline-block rounded-full border px-3 py-1 text-[11px] capitalize ${tone}`}>{status}</span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.12em] text-muted-foreground">{label.toUpperCase()}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-[11px] tracking-[0.12em] text-muted-foreground">{label.toUpperCase()}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}
