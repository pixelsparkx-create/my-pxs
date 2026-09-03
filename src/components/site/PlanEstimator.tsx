import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Download,
  Share2,
  Sparkles,
  MessageCircle,
  Check,
  Copy,
  Mail,
  Linkedin,
} from "lucide-react";
import { toast } from "sonner";
import {
  SITE_TYPES,
  PAGE_OPTIONS,
  FEATURE_OPTIONS,
  INTEGRATION_OPTIONS,
  DESIGN_DIRECTIONS,
  TIMELINES,
  formatRange,
  type EstimatorAnswers,
} from "@/lib/plan/estimator";
import { createPlan, markPlanShared, submitPlan, buildGoldieHandoff, GOLDIE_HANDOFF_KEY } from "@/lib/plan/api";
import {
  downloadPlanPdf,
  planShareUrl,
  planWhatsAppLink,
  planEmailLink,
  planWhatsAppMessage,
  type PlanRecord,
} from "@/lib/plan/plan";
import { logContactEvent } from "@/lib/contact-log";
import { LINKEDIN_URL } from "@/lib/contact";
import { PlanSummary } from "./PlanSummary";

const STEPS = ["About you", "Website type", "Pages", "Features", "Integrations", "Design", "Timeline"] as const;

function toggle(list: string[] | undefined, value: string) {
  const current = list ?? [];
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

function Option({
  label,
  selected,
  onClick,
  hint,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`text-left rounded-2xl border px-4 py-3 text-sm transition-all duration-300 hover:-translate-y-0.5 ${
        selected ? "border-gold bg-gold/10 shadow-gold" : "border-border bg-card hover:border-gold/60"
      }`}
    >
      <span className="flex items-center gap-2 font-medium">
        {selected && <Check className="h-3.5 w-3.5 text-gold shrink-0" />}
        {label}
      </span>
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const cls =
    "mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-gold placeholder:text-muted-foreground/60";
  return (
    <label className="block">
      <span className="text-[11px] font-semibold tracking-[0.15em] text-gold">{label.toUpperCase()}</span>
      {textarea ? (
        <textarea rows={3} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cls} />
      ) : (
        <input value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}

export function PlanEstimator() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<EstimatorAnswers>({});
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<PlanRecord | null>(null);

  const set = (patch: Partial<EstimatorAnswers>) => setAnswers((prev) => ({ ...prev, ...patch }));
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  async function generate() {
    setBusy(true);
    try {
      const created = await createPlan(answers);
      setPlan(created);
      void logContactEvent({
        source: "pricing_guide",
        kind: "received",
        title: "Website plan generated",
        message: created.rationale,
        client_name: created.client_name,
        business_name: created.business_name,
        project: created.project_goal,
        recommended_plan: created.recommended_plan,
        metadata: { reference: created.reference },
      });
      requestAnimationFrame(() => document.getElementById("your-plan")?.scrollIntoView({ behavior: "smooth" }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate your plan. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (plan) {
    return <PlanResult plan={plan} answers={answers} onRestart={() => { setPlan(null); setStep(0); setAnswers({}); }} />;
  }

  const canContinue =
    step === 0 ? Boolean(answers.business_name?.trim() || answers.client_name?.trim()) : step === 1 ? Boolean(answers.site_type) : true;

  return (
    <div className="rounded-3xl border border-border bg-card p-7 lg:p-9 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] text-gold">STEP {step + 1} OF {STEPS.length}</div>
          <h3 className="mt-1 text-2xl font-bold">{STEPS[step]}</h3>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">{progress}%</span>
      </div>

      <div className="mt-4 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-gradient-gold transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-8 min-h-[280px]">
        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Your name" value={answers.client_name} onChange={(v) => set({ client_name: v })} placeholder="Full name" />
            <TextField label="Business name" value={answers.business_name} onChange={(v) => set({ business_name: v })} placeholder="e.g. Lagos Hospitality Group" />
            <TextField label="Industry" value={answers.industry} onChange={(v) => set({ industry: v })} placeholder="e.g. Hospitality" />
            <TextField label="Target audience" value={answers.target_audience} onChange={(v) => set({ target_audience: v })} placeholder="Who is this website for?" />
            <div className="sm:col-span-2">
              <TextField
                label="What do you want the website to do?"
                value={answers.project_goal}
                onChange={(v) => set({ project_goal: v })}
                placeholder="e.g. Take hotel bookings online and showcase our rooms"
                textarea
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {SITE_TYPES.map((t) => (
              <Option key={t} label={t} selected={answers.site_type === t} onClick={() => set({ site_type: t })} />
            ))}
          </div>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-muted-foreground mb-4">Select every page your website needs.</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {PAGE_OPTIONS.map((p) => (
                <Option key={p} label={p} selected={(answers.pages ?? []).includes(p)} onClick={() => set({ pages: toggle(answers.pages, p) })} />
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm text-muted-foreground mb-4">What should the website actually be able to do?</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {FEATURE_OPTIONS.map((f) => (
                <Option
                  key={f.label}
                  label={f.label}
                  hint={f.cost === 0 ? "Included" : f.body}
                  selected={(answers.features ?? []).includes(f.label)}
                  onClick={() => set({ features: toggle(answers.features, f.label) })}
                />
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <p className="text-sm text-muted-foreground mb-4">Anything the website needs to connect to?</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {INTEGRATION_OPTIONS.map((i) => (
                <Option
                  key={i.label}
                  label={i.label}
                  hint={i.cost === 0 ? "Included" : i.body}
                  selected={(answers.integrations ?? []).includes(i.label)}
                  onClick={() => set({ integrations: toggle(answers.integrations, i.label) })}
                />
              ))}
            </div>
          </>
        )}

        {step === 5 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {DESIGN_DIRECTIONS.map((d) => (
              <Option key={d} label={d} selected={answers.design_direction === d} onClick={() => set({ design_direction: d })} />
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {TIMELINES.map((t) => (
              <Option key={t} label={t} selected={answers.timeline === t} onClick={() => set({ timeline: t })} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canContinue}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-gold text-ink px-6 py-2.5 text-sm font-semibold shadow-gold transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-50"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={generate}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-gold text-ink px-6 py-2.5 text-sm font-semibold shadow-gold transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Building your plan…" : "Generate my plan"}
          </button>
        )}
      </div>
    </div>
  );
}

function PlanResult({
  plan,
  answers,
  onRestart,
}: {
  plan: PlanRecord;
  answers: EstimatorAnswers;
  onRestart: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  async function share() {
    const url = planShareUrl(plan.reference);
    const text = `${plan.business_name ?? "My"} website plan — ${plan.recommended_plan}, estimated ${formatRange(plan.estimate_min, plan.estimate_max)}.`;
    void markPlanShared(plan.reference);
    void logContactEvent({
      source: "pricing_guide",
      kind: "initiated",
      title: "Plan share initiated",
      business_name: plan.business_name,
      client_name: plan.client_name,
      recommended_plan: plan.recommended_plan,
      metadata: { reference: plan.reference },
    });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "PixelSpark Website Project Plan", text, url });
        return;
      } catch {
        /* user dismissed the share sheet — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Plan link copied to your clipboard.");
    } catch {
      toast.error(`Copy this link: ${url}`);
    }
  }

  function continueWithGoldie() {
    try {
      window.localStorage.setItem(GOLDIE_HANDOFF_KEY, buildGoldieHandoff(plan, answers));
    } catch {
      /* private mode — Goldie still opens, just without the prefill */
    }
    window.dispatchEvent(new CustomEvent("pixelspark:open-goldie"));
  }

  async function submit() {
    setSubmitting(true);
    try {
      await submitPlan({
        reference: plan.reference,
        client_name: plan.client_name,
        contact_email: email.trim() || null,
        contact_phone: phone.trim() || null,
      });
      setSubmitted(true);
      toast.success("Your plan is with PixelSpark — we'll be in touch.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't submit your plan. Please try WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="your-plan" className="space-y-8 scroll-mt-24">
      <div className="text-center">
        <div className="text-xs font-semibold tracking-[0.2em] text-gold">YOUR PIXELSPARK WEBSITE PLAN</div>
        <h3 className="mt-2 text-3xl lg:text-4xl font-bold">
          {plan.business_name || plan.client_name || "Your project"},{" "}
          <span className="bg-gradient-gold bg-clip-text text-transparent">planned.</span>
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">Plan reference {plan.reference}</p>
      </div>

      <PlanSummary plan={plan} />

      <div className="rounded-3xl border border-gold/40 bg-gold/5 p-7">
        <div className="text-xs font-semibold tracking-[0.15em] text-gold">READY TO BUILD?</div>
        <h4 className="mt-1 text-xl font-bold">Take your plan with you.</h4>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => {
              if (!downloadPlanPdf(plan)) toast.error("Allow pop-ups to download your plan as a PDF.");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold text-ink px-5 py-3 text-sm font-semibold shadow-gold transition-transform hover:-translate-y-0.5"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
          <button
            onClick={share}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
          >
            <Share2 className="h-4 w-4" /> Share Plan
          </button>
          <button
            onClick={continueWithGoldie}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
          >
            <Sparkles className="h-4 w-4" /> Discuss with Goldie
          </button>
          <a
            href={planWhatsAppLink(plan)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              void markPlanShared(plan.reference);
              void logContactEvent({
                source: "whatsapp",
                kind: "initiated",
                title: "WhatsApp contact initiated",
                message: planWhatsAppMessage(plan),
                client_name: plan.client_name,
                business_name: plan.business_name,
                recommended_plan: plan.recommended_plan,
                metadata: { reference: plan.reference },
              });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <a
            href={planEmailLink(plan)}
            onClick={() =>
              void logContactEvent({
                source: "email",
                kind: "initiated",
                title: "Email contact initiated",
                client_name: plan.client_name,
                business_name: plan.business_name,
                recommended_plan: plan.recommended_plan,
                metadata: { reference: plan.reference },
              })
            }
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-gold"
          >
            <Mail className="h-3.5 w-3.5" /> Email your plan
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              void logContactEvent({
                source: "linkedin",
                kind: "initiated",
                title: "LinkedIn contact initiated",
                client_name: plan.client_name,
                business_name: plan.business_name,
                recommended_plan: plan.recommended_plan,
                metadata: { reference: plan.reference },
              })
            }
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-gold"
          >
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </a>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(planShareUrl(plan.reference));
                toast.success("Plan link copied.");
              } catch {
                toast.error("Couldn't copy the link.");
              }
            }}
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-gold"
          >
            <Copy className="h-3.5 w-3.5" /> Copy plan link
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-7">
        {submitted ? (
          <div className="flex items-start gap-3">
            <span className="h-9 w-9 shrink-0 rounded-full bg-gradient-gold text-ink grid place-items-center shadow-gold">
              <Check className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <div>
              <div className="font-bold">Plan submitted to PixelSpark</div>
              <p className="text-sm text-muted-foreground mt-1">
                Reference {plan.reference}. Mohammed will review your requirements and come back with a clear final
                quote.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-xs font-semibold tracking-[0.15em] text-gold">START YOUR PROJECT</div>
            <h4 className="mt-1 text-xl font-bold">Send this plan to PixelSpark.</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Leave a contact detail and we'll pick this project up from exactly where you left it.
            </p>
            <div className="mt-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="WhatsApp number"
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold"
              />
              <button
                onClick={submit}
                disabled={submitting || (!email.trim() && !phone.trim())}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold text-ink px-6 py-2.5 text-sm font-semibold shadow-gold transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {submitting ? "Sending…" : "Submit plan"}
              </button>
            </div>
          </>
        )}
        <button onClick={onRestart} className="mt-5 text-xs text-muted-foreground transition-colors hover:text-gold">
          Start a new estimate
        </button>
      </div>
    </div>
  );
}
