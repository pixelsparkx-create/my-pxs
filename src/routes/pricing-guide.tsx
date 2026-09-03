import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { PricingGuide } from "@/components/site/PricingGuide";

export const Route = createFileRoute("/pricing-guide")({
  head: () => ({
    meta: [
      { title: "Pricing Guide — What's Included | PixelSpark" },
      {
        name: "description",
        content:
          "Full breakdown of PixelSpark packages: what's included, what costs extra, and how your final project price is agreed before development begins.",
      },
      { property: "og:title", content: "Pricing Guide — What's Included | PixelSpark" },
      {
        property: "og:description",
        content:
          "Transparent scope, clear pricing, no hidden development charges. See exactly what each PixelSpark package covers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingGuidePage,
});

function PricingGuidePage() {
  return (
    <SiteShell>
      <PricingGuide />
    </SiteShell>
  );
}
