import { useState } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { projects, type Project } from "@/lib/projects";
import { ProjectShowcase } from "./ProjectShowcase";

export function Portfolio() {
  const [active, setActive] = useState<Project | null>(null);
  const featured = projects.slice(0, 4);

  return (
    <section id="portfolio" className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">RECENT WORK</div>
          <h2 className="text-3xl lg:text-5xl font-bold">Some Things I've Built</h2>
        </div>
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all"
        >
          View All Projects <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((p) => (
          <button
            key={p.slug}
            onClick={() => setActive(p)}
            className="group block text-left"
          >
            <div className="relative overflow-hidden rounded-2xl bg-muted aspect-[4/3] shadow-card hover:shadow-gold transition-shadow">
              <img
                src={p.cover}
                alt={p.title}
                loading="lazy"
                width={800}
                height={600}
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
      <ProjectShowcase project={active} onClose={() => setActive(null)} />
    </section>
  );
}
