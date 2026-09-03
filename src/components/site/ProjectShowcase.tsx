import { useEffect, useState, useCallback } from "react";
import { X, ExternalLink, ChevronLeft, ChevronRight, CheckCircle2, Layers, Sparkles, Users, MapPin } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import type { Project } from "@/lib/projects";
import { EngagementBar, useProjectEngagement } from "@/components/site/ProjectEngagement";

export function ProjectShowcase({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const open = !!project;
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start" });
  const [index, setIndex] = useState(0);
  const { counts, appreciated, appreciate, registerLiveVisit } = useProjectEngagement(
    project?.slug ?? null,
  );

  const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);


  useEffect(() => {
    if (!embla) return;
    const onSel = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", onSel);
    onSel();
    return () => {
      embla.off("select", onSel);
    };
  }, [embla]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, scrollPrev, scrollNext]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/70 backdrop-blur-md"
      />
      <aside
        className="relative w-full sm:max-w-2xl lg:max-w-3xl h-full overflow-y-auto bg-background shadow-2xl border-l border-gold/20"
        style={{ animation: "slide-in-right 0.45s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 lg:px-8 py-4 bg-background/85 backdrop-blur-xl border-b border-border">
          <div className="text-xs font-semibold tracking-[0.2em] text-gold">{project.category.toUpperCase()}</div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-card border border-border hover:border-gold hover:text-gold transition-all flex items-center justify-center"
            aria-label="Close showcase"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 lg:px-8 pt-6">
          <h2 className="text-3xl lg:text-4xl font-bold font-display">{project.title}</h2>
          <p className="mt-3 text-foreground/75 leading-relaxed">{project.description}</p>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={registerLiveVisit}
              className="mt-5 inline-flex items-center gap-2 bg-gradient-gold text-ink px-6 py-3 rounded-full font-semibold shadow-gold hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:scale-[1.03] transition-all"
            >
              View Live Project <ExternalLink className="h-4 w-4" />
            </a>
          )}

          <EngagementBar counts={counts} appreciated={appreciated} onAppreciate={appreciate} />
        </div>


        <div className="mt-7 relative">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {project.gallery.map((src, i) => (
                <div key={i} className="min-w-0 flex-[0_0_100%] px-6 lg:px-8">
                  <div className="relative overflow-hidden rounded-2xl bg-muted aspect-[16/10] group">
                    <img
                      src={src}
                      alt={`${project.title} screenshot ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={scrollPrev}
            aria-label="Previous"
            className="absolute left-10 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-ink/70 backdrop-blur text-ink-foreground hover:bg-gradient-gold hover:text-ink transition-all flex items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next"
            className="absolute right-10 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-ink/70 backdrop-blur text-ink-foreground hover:bg-gradient-gold hover:text-ink transition-all flex items-center justify-center"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="mt-3 flex justify-center gap-1.5">
            {project.gallery.map((_, i) => (
              <button
                key={i}
                onClick={() => embla?.scrollTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-gold" : "w-1.5 bg-border"}`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 lg:px-8 py-8 grid sm:grid-cols-2 gap-4">
          <InfoCard icon={<Users className="h-4 w-4" />} label="Client">
            {project.client}
          </InfoCard>
          <InfoCard icon={<Sparkles className="h-4 w-4" />} label="Category">
            {project.category}
          </InfoCard>
          {project.location && (
            <InfoCard icon={<MapPin className="h-4 w-4" />} label="Location">
              {project.location}
            </InfoCard>
          )}
          <InfoCard icon={<Layers className="h-4 w-4" />} label="Technologies" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2 mt-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </InfoCard>
        </div>

        <div className="px-6 lg:px-8 pb-10">
          <h3 className="text-sm font-semibold tracking-[0.2em] text-gold uppercase mb-4">Features Included</h3>
          <ul className="space-y-3">
            {project.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-foreground/85">
                <CheckCircle2 className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={registerLiveVisit}
              className="mt-8 w-full inline-flex items-center justify-center gap-2 bg-ink text-ink-foreground px-6 py-3.5 rounded-full font-semibold hover:bg-gradient-gold hover:text-ink transition-all"
            >
              Visit Website <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-4 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gold uppercase">
        {icon} {label}
      </div>
      <div className="mt-1.5 text-sm text-foreground/85">{children}</div>
    </div>
  );
}
