import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Download, MessageCircle, Mail, Linkedin, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PlanSummary } from "@/components/site/PlanSummary";
import { fetchSharedPlan } from "@/lib/plan/api";
import { downloadPlanPdf, planWhatsAppLink, planEmailLink, type PlanRecord } from "@/lib/plan/plan";
import { LINKEDIN_URL } from "@/lib/contact";
import { toast } from "sonner";

export const Route = createFileRoute("/plan/$reference")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Website Project Plan | PixelSpark" },
      {
        name: "description",
        content:
          "A personalised PixelSpark website project plan: recommended package, estimated investment range and full project requirements.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Your Website Project Plan | PixelSpark" },
      {
        property: "og:description",
        content: "Recommended package, estimated investment range and project requirements — prepared by PixelSpark.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SharedPlanPage,
});

function SharedPlanPage() {
  const { reference } = Route.useParams();
  const [plan, setPlan] = useState<PlanRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchSharedPlan(reference).then((result) => {
      if (!active) return;
      setPlan(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [reference]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 lg:px-10 py-16 lg:py-24">
        {loading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : !plan ? (
          <div className="text-center py-20">
            <div className="text-xs font-semibold tracking-[0.2em] text-gold">PLAN NOT FOUND</div>
            <h1 className="mt-3 text-3xl font-bold">We couldn't find that plan.</h1>
            <p className="mt-3 text-muted-foreground">
              The reference <strong>{reference}</strong> doesn't match any PixelSpark website plan. Generate a new one
              from the pricing guide.
            </p>
            <a
              href="/pricing-guide#estimator"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-gold text-ink px-6 py-3 font-semibold shadow-gold"
            >
              Build my plan <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <>
            <header className="text-center mb-10">
              <div className="text-xs font-semibold tracking-[0.2em] text-gold">PIXELSPARK WEBSITE PROJECT PLAN</div>
              <h1 className="mt-3 text-3xl lg:text-5xl font-bold">
                {plan.business_name || plan.client_name || "Website project plan"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">Reference {plan.reference}</p>
            </header>

            <PlanSummary plan={plan} />

            <div className="mt-10 rounded-3xl bg-gradient-ink text-ink-foreground p-8 lg:p-10 text-center shadow-card">
              <h2 className="text-2xl lg:text-3xl font-bold">Ready to build?</h2>
              <p className="mt-3 text-sm text-ink-foreground/75 max-w-xl mx-auto">
                This is an estimate, not an official quote. Talk to PixelSpark and we'll confirm your scope and send a
                clear final quote before development begins.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <a
                  href={planWhatsAppLink(plan)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-gold text-ink px-6 py-3 text-sm font-semibold shadow-gold transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="h-4 w-4" /> Start Your Project
                </a>
                <button
                  onClick={() => {
                    if (!downloadPlanPdf(plan)) toast.error("Allow pop-ups to download this plan as a PDF.");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/30 px-6 py-3 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
                <a
                  href={planEmailLink(plan)}
                  className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/30 px-6 py-3 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
                >
                  <Mail className="h-4 w-4" /> Email
                </a>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/30 px-6 py-3 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </SiteShell>
  );
}
