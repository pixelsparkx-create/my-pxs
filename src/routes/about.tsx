import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { About } from "@/components/site/About";
import { Stats } from "@/components/site/Stats";
import { Trust } from "@/components/site/Trust";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Mohammed — PixelSpark" },
      { name: "description", content: "Meet Mohammed, the founder of PixelSpark — building premium websites, apps and digital products that help brands grow." },
      { property: "og:title", content: "About Mohammed — PixelSpark" },
      { property: "og:description", content: "Young mind. Serious craft. Premium digital work for ambitious brands." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <div className="pt-8">
        <About />
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pb-12">
          <Stats />
        </div>
        <Trust />
        <CTA />
      </div>
    </SiteShell>
  );
}
