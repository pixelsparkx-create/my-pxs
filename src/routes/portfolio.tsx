import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { CTA } from "@/components/site/CTA";
import { ProjectShowcase } from "@/components/site/ProjectShowcase";
import { categories, projects, type Category, type Project } from "@/lib/projects";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — PixelSpark" },
      { name: "description", content: "Selected work by PixelSpark: hotel platforms, business websites, mobile apps, UI concepts and games." },
      { property: "og:title", content: "Portfolio — PixelSpark" },
      { property: "og:description", content: "Recent websites, apps and digital products built by Mohammed at PixelSpark." },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const [active, setActive] = useState<Category>("All");
  const [showcase, setShowcase] = useState<Project | null>(null);
  const visible = projects.filter((p) => active === "All" || p.category === active);

  return (
    <SiteShell>
      <div className="pt-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-8 pb-6">
          <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">PORTFOLIO</div>
          <h1 className="text-4xl lg:text-6xl font-bold">Selected Work</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            A snapshot of the digital products I've shipped — built premium, designed to convert.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  active === c
                    ? "bg-gradient-gold text-ink shadow-gold"
                    : "bg-card border border-border text-foreground/70 hover:border-gold hover:text-gold"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-10 pb-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((p, i) => (
            <button
              key={p.slug}
              onClick={() => setShowcase(p)}
              className="group block text-left animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-muted aspect-[4/3] shadow-card hover:shadow-gold transition-shadow">
                <img
                  src={p.cover}
                  alt={p.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <span className="text-xs font-semibold text-ink-foreground bg-ink/60 backdrop-blur px-2.5 py-1 rounded-full">
                    {p.category}
                  </span>
                  <span className="h-9 w-9 rounded-full bg-gradient-gold text-ink flex items-center justify-center shadow-gold">
                    <ExternalLink className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-gold font-semibold tracking-wider uppercase">{p.tag}</div>
                <h3 className="mt-1 font-semibold text-foreground group-hover:text-gold transition-colors">{p.title}</h3>
              </div>
            </button>
          ))}
        </div>
        <CTA />
      </div>
      <ProjectShowcase project={showcase} onClose={() => setShowcase(null)} />
    </SiteShell>
  );
}
