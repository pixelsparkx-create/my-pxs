import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Pricing } from "@/components/site/Pricing";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — PixelSpark" },
      { name: "description", content: "Simple, transparent packages — Starter ₦25,000, Growth ₦60,000, Premium ₦100,000." },
      { property: "og:title", content: "Pricing — PixelSpark" },
      { property: "og:description", content: "Three packages, real value. Pick a plan and get a project request ready in seconds." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <SiteShell>
      <div className="pt-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-8 pb-6 text-center">
          <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">PRICING</div>
          <h1 className="text-4xl lg:text-6xl font-bold">Simple Packages, Real Value</h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Pick a plan that fits your stage. Tap "Choose Plan" and your project request will be pre-filled.
          </p>
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-8">
          <Pricing />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pb-12">
          <Testimonials />
        </div>
        <CTA />
      </div>
    </SiteShell>
  );
}
