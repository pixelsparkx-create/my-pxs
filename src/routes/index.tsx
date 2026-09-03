import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { Portfolio } from "@/components/site/Portfolio";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";
import { FeaturedCaseStudy } from "@/components/site/FeaturedCaseStudy";


import { Process } from "@/components/site/Process";
import { Pricing } from "@/components/site/Pricing";
import { Testimonials } from "@/components/site/Testimonials";
import { Stats } from "@/components/site/Stats";
import { CTA } from "@/components/site/CTA";
import { About } from "@/components/site/About";
import { Trust } from "@/components/site/Trust";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PixelSpark — Premium Websites, Apps & Digital Experiences" },
      { name: "description", content: "PixelSpark builds premium websites, mobile apps and creative digital products that help businesses look professional and grow online." },
      { property: "og:title", content: "PixelSpark — Premium Websites, Apps & Digital Experiences" },
      { property: "og:description", content: "Modern, high-performing websites, apps and creative digital solutions by Mohammed." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteShell>
      <Hero />
      <Trust />
      <Services />
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-12 grid lg:grid-cols-2 gap-6">
        <Process />
        <Pricing />
      </section>
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-12 grid lg:grid-cols-2 gap-6">
        <Testimonials />
        <Stats />
      </section>
      <FeaturedProducts />
      <FeaturedCaseStudy />
      <Portfolio />


      <About />
      <CTA />
    </SiteShell>
  );
}
