import { Check, Sparkles } from "lucide-react";
import { PACKAGES, formatRange, type PlanName } from "@/lib/plan/estimator";
import type { PlanRecord } from "@/lib/plan/plan";

function naira(value: number) {
  return `₦${Number(value ?? 0).toLocaleString("en-NG")}`;
}

function Chips({ label, items }: { label: string; items?: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.15em] text-gold">{label.toUpperCase()}</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span key={i} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs">
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Shared, client-safe rendering of a generated website plan (estimator result + public /plan route). */
export function PlanSummary({ plan }: { plan: PlanRecord }) {
  const key = (plan.recommended_plan as PlanName) in PACKAGES ? (plan.recommended_plan as PlanName) : "Growth";
  const pkg = PACKAGES[key];
  const factors = plan.complexity_factors ?? [];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-ink text-ink-foreground p-8 lg:p-10 shadow-card">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase bg-gold/20 text-gold px-3 py-1 rounded-full">
          <Sparkles className="h-3 w-3" /> Recommended package
        </div>
        <div className="mt-5 grid lg:grid-cols-2 gap-8">
          <div>
            <div className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">{plan.recommended_plan}</div>
            <div className="text-sm text-ink-foreground/70 mt-1">
              {pkg.sub} · {naira(plan.base_price)} base package
            </div>
            {plan.rationale && (
              <p className="mt-5 text-sm text-ink-foreground/80 leading-relaxed border-l-2 border-gold/60 pl-4">
                {plan.rationale}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-gold/40 bg-white/5 p-6">
            <div className="text-xs tracking-[0.2em] text-gold">ESTIMATED INVESTMENT</div>
            <div className="mt-2 text-3xl lg:text-4xl font-bold">
              {formatRange(plan.estimate_min, plan.estimate_max)}
            </div>
            <p className="mt-3 text-xs text-ink-foreground/70 leading-relaxed">
              This is an estimate, not an official quote. Your final price is confirmed with you after we review your
              requirements together — development only begins once you approve the scope.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-border bg-card p-7">
          <div className="text-xs font-semibold tracking-[0.15em] text-gold mb-3">
            WHAT {plan.recommended_plan.toUpperCase()} INCLUDES
          </div>
          <ul className="space-y-2">
            {pkg.includes.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" /> <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-7 space-y-5">
          <div className="text-xs font-semibold tracking-[0.15em] text-gold">YOUR PROJECT</div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {plan.client_name && <Field label="Client" value={plan.client_name} />}
            {plan.business_name && <Field label="Business" value={plan.business_name} />}
            {plan.industry && <Field label="Industry" value={plan.industry} />}
            {plan.timeline && <Field label="Timeline" value={plan.timeline} />}
            {plan.design_direction && <Field label="Design direction" value={plan.design_direction} />}
            {plan.target_audience && <Field label="Target audience" value={plan.target_audience} />}
          </div>
          {plan.project_goal && (
            <div>
              <div className="text-[11px] font-semibold tracking-[0.15em] text-gold">PROJECT GOAL</div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.project_goal}</p>
            </div>
          )}
          <Chips label="Requested pages" items={plan.required_pages} />
          <Chips label="Requested features" items={plan.required_features} />
          <Chips label="Integrations" items={plan.required_integrations} />
        </div>
      </div>

      {factors.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-7">
          <div className="text-xs font-semibold tracking-[0.15em] text-gold mb-1">ADDITIONAL REQUIREMENTS IDENTIFIED</div>
          <p className="text-sm text-muted-foreground mb-5">
            These sit outside the base package. We show them up front so nothing surprises you later.
          </p>
          <div className="divide-y divide-border">
            {factors.map((f) => (
              <div key={f.title} className="py-3 flex items-start justify-between gap-6">
                <div>
                  <div className="font-medium text-sm">{f.title}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.body}</p>
                </div>
                <div className="text-sm font-semibold whitespace-nowrap">+{naira(f.cost)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.15em] text-gold">{label.toUpperCase()}</div>
      <div className="text-sm text-muted-foreground">{value}</div>
    </div>
  );
}
