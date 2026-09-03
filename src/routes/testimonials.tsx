import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — PixelSpark" },
      { name: "description", content: "Real feedback from clients who hired PixelSpark to build websites, apps and digital experiences." },
      { property: "og:title", content: "Testimonials — PixelSpark" },
      { property: "og:description", content: "Hear from clients about working with Mohammed at PixelSpark." },
    ],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  return (
    <SiteShell>
      <div className="pt-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-8 pb-6">
          <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">TESTIMONIALS</div>
          <h1 className="text-4xl lg:text-6xl font-bold">Words From Clients</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Honest feedback from people I've worked with — share yours too.
          </p>
        </div>
        <div className="mx-auto max-w-5xl px-6 lg:px-10 pb-16">
          <Testimonials />
        </div>
        <CTA />
      </div>
    </SiteShell>
  );
}
