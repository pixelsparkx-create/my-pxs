import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Services } from "@/components/site/Services";
import { Process } from "@/components/site/Process";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — PixelSpark" },
      { name: "description", content: "Websites, mobile apps, hotel booking platforms, UI/UX, games and brand digital presence — built premium." },
      { property: "og:title", content: "Services — PixelSpark" },
      { property: "og:description", content: "Premium websites, apps and digital products. Tap any service for tech, timeline and ideal fit." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <SiteShell>
      <div className="pt-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-8 pb-4">
          <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">SERVICES</div>
          <h1 className="text-4xl lg:text-6xl font-bold">What I Build For You</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            A complete digital studio for ambitious brands — from landing pages to full-stack apps.
          </p>
        </div>
        <Services />
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-8">
          <Process />
        </div>
        <CTA />
      </div>
    </SiteShell>
  );
}
