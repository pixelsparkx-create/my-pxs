import { createFileRoute, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { startPaymentCheckout, verifyPayment } from "@/lib/payments/payments.functions";
import {
  formatMoney,
  isPayable,
  paymentTypeLabel,
  type PublicPaymentRequest,
} from "@/lib/payments/shared";
import {
  Loader2,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  CalendarClock,
  CreditCard,
} from "lucide-react";

export const Route = createFileRoute("/pay/$code")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Secure Payment — PixelSpark" },
      { name: "description", content: "Complete your PixelSpark project payment securely. The amount is locked to the price agreed with the studio." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Secure Payment — PixelSpark" },
      { property: "og:description", content: "Complete your PixelSpark project payment securely via Flutterwave." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PayPage,
});

function PayPage() {
  const { code } = useParams({ from: "/pay/$code" });
  const startCheckout = useServerFn(startPaymentCheckout);
  const verify = useServerFn(verifyPayment);

  const [request, setRequest] = useState<PublicPaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await (supabase as any).rpc("get_public_payment_request", { _code: code });
    const row = Array.isArray(data) ? data[0] : data;
    setRequest((row as PublicPaymentRequest) ?? null);
    setLoading(false);
    return (row as PublicPaymentRequest) ?? null;
  }, [code]);

  useEffect(() => {
    void (async () => {
      await load();
      const txRef = new URLSearchParams(window.location.search).get("tx_ref");
      if (!txRef) return;
      setWorking(true);
      const result = await verify({ data: { code, txRef } }).catch(() => null);
      if (result && !result.ok && "error" in result && result.error) setError(result.error);
      await load();
      setWorking(false);
    })();
  }, [code, load, verify]);

  async function pay() {
    setError(null);
    setWorking(true);
    const result = await startCheckout({ data: { code, origin: window.location.origin } }).catch(() => null);
    if (result?.ok) {
      window.location.href = result.link;
      return;
    }
    setError(result && "error" in result ? (result.error as string) : "Something went wrong. Please try again.");
    setWorking(false);
  }

  return (
    <main className="min-h-screen bg-background grid place-items-center px-5 py-16">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 font-display font-bold tracking-tight mb-8">
          <Sparkles className="h-5 w-5 text-gold" strokeWidth={1.5} />
          PIXELSPARK
        </div>

        {loading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : !request ? (
          <Card>
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
              <h1 className="font-display text-2xl mt-4">Payment request not found</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Please double-check the link, or contact Mohammed for a fresh payment link.
              </p>
            </div>
          </Card>
        ) : request.status === "paid" ? (
          <Card>
            <div className="text-center">
              <CheckCircle2 className="h-10 w-10 text-gold mx-auto" strokeWidth={1.5} />
              <h1 className="font-display text-2xl mt-4">Payment received</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Thank you — {formatMoney(request.amount, request.currency)} has been confirmed for{" "}
                {request.project_name ?? "your project"}.
              </p>
              <p className="text-xs text-muted-foreground mt-4">Reference {request.request_code}</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-xs tracking-[0.2em] text-gold">{paymentTypeLabel(request.payment_type).toUpperCase()}</div>
            <h1 className="font-display text-3xl mt-2">{request.project_name ?? "PixelSpark Project"}</h1>
            {request.client_name && (
              <p className="text-sm text-muted-foreground mt-1">Prepared for {request.client_name}</p>
            )}

            <div className="mt-7 rounded-2xl border border-gold/30 bg-gold/5 p-6 text-center">
              <div className="text-xs tracking-[0.15em] text-muted-foreground">AMOUNT DUE</div>
              <div className="font-display text-4xl mt-2">{formatMoney(request.amount, request.currency)}</div>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-gold" /> Amount locked to the agreed price
              </div>
            </div>

            {request.description && (
              <p className="text-sm text-muted-foreground mt-6 leading-relaxed whitespace-pre-line">
                {request.description}
              </p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <Row label="Reference" value={request.request_code} />
              <Row label="Status" value={request.status} />
              {request.project_type && <Row label="Project type" value={request.project_type} />}
              {request.expires_at && (
                <Row label="Valid until" value={new Date(request.expires_at).toLocaleDateString()} icon />
              )}
            </dl>

            {error && (
              <div className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {isPayable(request) ? (
              <button
                onClick={pay}
                disabled={working}
                className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold text-ink font-semibold px-6 py-4 shadow-gold hover:opacity-95 disabled:opacity-60 transition"
              >
                {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {working ? "Opening secure checkout…" : `Pay ${formatMoney(request.amount, request.currency)}`}
              </button>
            ) : (
              <div className="mt-7 rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground text-center">
                This request is {request.status} and can no longer be paid.
              </div>
            )}

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-gold" /> Secured by Flutterwave — card, bank transfer & USSD
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-7 sm:p-9 shadow-xl shadow-black/5">{children}</div>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <dt className="text-[11px] tracking-[0.12em] text-muted-foreground">{label.toUpperCase()}</dt>
      <dd className="mt-1 inline-flex items-center gap-1.5 font-medium capitalize">
        {icon && <CalendarClock className="h-3.5 w-3.5 text-gold" />}
        {value}
      </dd>
    </div>
  );
}
