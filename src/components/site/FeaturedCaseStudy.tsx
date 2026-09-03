import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BedDouble,
  CheckCircle2,
  ExternalLink,
  Gauge,
  Images,
  MapPin,
  Menu,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Wand2,
} from "lucide-react";
import { NEVADA_URL, nevadaShots } from "@/lib/projects";

const [shotHero, shotRooms, shotAbout] = nevadaShots;

const goals = [
  "Build a premium online presence",
  "Showcase hotel rooms and facilities",
  "Increase customer trust",
  "Improve mobile experience",
  "Encourage direct enquiries and bookings",
  "Reflect the hotel's luxury brand",
];

const features = [
  { icon: Sparkles, title: "Luxury Landing Page", copy: "Cinematic hero that sells the stay instantly." },
  { icon: BedDouble, title: "Room Showcase", copy: "Classic, Deluxe and premium suites with pricing." },
  { icon: UtensilsCrossed, title: "Restaurant & Bar", copy: "Dining and lounge experience presented elegantly." },
  { icon: Images, title: "Gallery", copy: "Curated photography of rooms, pool and interiors." },
  { icon: Smartphone, title: "Mobile Optimized", copy: "Designed mobile-first for on-the-go bookings." },
  { icon: MapPin, title: "Location & Contact", copy: "Clear directions and one-tap enquiry channels." },
  { icon: Menu, title: "Modern Navigation", copy: "Effortless browsing with a persistent Book Now." },
  { icon: Gauge, title: "Fast Loading", copy: "Optimized assets for quick, smooth page loads." },
  { icon: Wand2, title: "Elegant UI", copy: "Refined typography, spacing and soft motion." },
  { icon: CheckCircle2, title: "Responsive Design", copy: "Pixel-perfect on desktop, tablet and mobile." },
];

const stack = ["React", "TypeScript", "Tailwind CSS", "Responsive Design", "Modern UI/UX", "Netlify"];

const highlights = [
  "Modern Responsive Design",
  "Premium User Experience",
  "Optimized for Mobile",
  "Luxury Brand Identity",
  "Fast Performance",
  "Easy Navigation",
];

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), {
      threshold: 0,
      rootMargin: "0px 0px -5% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, seen };
}

function BrowserFrame({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-background shadow-card transition-transform duration-500 hover:-translate-y-1.5 ${className}`}
    >
      <div className="flex items-center gap-1.5 bg-ink px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-ink-foreground/30" />
        <span className="h-2 w-2 rounded-full bg-ink-foreground/30" />
        <span className="h-2 w-2 rounded-full bg-gold/60" />
      </div>
      <img src={src} alt={alt} loading="lazy" className="w-full object-cover" />
    </div>
  );
}

export function FeaturedCaseStudy() {
  const { ref, seen } = useInView<HTMLElement>();

  return (
    <section
      id="case-study"
      ref={ref}
      className="mx-auto max-w-7xl px-6 lg:px-10 py-20"
    >
      <div className="mb-12">
        <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">FEATURED CASE STUDY</div>
        <h2 className="text-3xl lg:text-5xl font-bold">Nevada Hotels &amp; Suites</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Luxury Hotel Website Designed to Inspire Comfort &amp; Drive Bookings
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative grid lg:grid-cols-2 gap-10 p-6 sm:p-10 lg:p-14">
          {/* Copy */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-ink-foreground">
                Business Website
              </span>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold text-gold">
                Hospitality
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold text-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Completed
              </span>
            </div>

            <h3 className="mt-5 font-display text-3xl lg:text-4xl font-bold tracking-tight">
              Luxury Hotel Website Designed to Inspire Comfort &amp; Drive Bookings
            </h3>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-gold font-semibold">
              <MapPin className="h-4 w-4" /> Lekki, Lagos
            </p>

            <p className="mt-5 leading-relaxed text-foreground/75">
              Nevada Hotels &amp; Suites is a modern hospitality website designed to showcase a
              premium hotel experience while making it easy for guests to explore rooms, amenities,
              and contact the hotel. The goal was a clean, elegant, mobile-friendly site that
              reflects luxury, builds trust, and encourages direct bookings.
            </p>
            <p className="mt-3 leading-relaxed text-foreground/75">
              Nestled in the vibrant heart of Lekki, Lagos, the hotel offers modern rooms, quality
              dining, a swimming pool, 24-hour power supply and exceptional customer service — the
              website communicates warmth, professionalism and affordability while positioning it as
              a premium destination.
            </p>

            <div className="mt-8">
              <div className="text-xs font-semibold tracking-[0.2em] text-gold">PROJECT GOALS</div>
              <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {goals.map((g, i) => (
                  <li
                    key={g}
                    className={`flex items-start gap-2.5 text-sm text-foreground/85 transition-all duration-500 ${
                      seen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                    }`}
                    style={{ transitionDelay: `${120 + i * 70}ms` }}
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {stack.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={NEVADA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 font-semibold text-ink shadow-gold transition-transform hover:scale-[1.03]"
              >
                Visit Live Website <ExternalLink className="h-4 w-4" />
              </a>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-ink-foreground transition-all hover:bg-gradient-gold hover:text-ink"
              >
                View More Projects <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Visuals */}
          <div className="relative min-w-0">
            <div
              className={`transition-all duration-1000 ${
                seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <BrowserFrame src={shotHero} alt="Nevada Hotels & Suites landing page hero" />
            </div>

            <div className="relative z-10 -mt-4 sm:-mt-8 sm:ml-10 grid sm:grid-cols-[1.4fr_1fr] items-end gap-4">
              <div
                className={`overflow-hidden rounded-2xl border border-gold/25 bg-background/70 shadow-gold backdrop-blur-xl transition-all duration-1000 hover:-translate-y-1.5 ${
                  seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: "250ms" }}
              >
                <img
                  src={shotRooms}
                  alt="Nevada Hotels rooms and suites with nightly rates"
                  loading="lazy"
                  className="w-full object-cover"
                />
              </div>

              <div
                className={`w-full rounded-2xl border border-gold/25 bg-background/80 p-4 shadow-gold backdrop-blur-xl transition-all duration-1000 ${
                  seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: "450ms" }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  Rooms from
                </div>
                <div className="mt-2 text-2xl font-bold leading-none">
                  ₦25,000<span className="text-sm text-muted-foreground"> /night</span>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-foreground/70">
                  Classic, Deluxe &amp; Executive suites with instant Book Now
                </p>
              </div>
            </div>

            <div
              className={`mt-4 sm:mt-6 sm:mr-10 transition-all duration-1000 ${
                seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <BrowserFrame src={shotAbout} alt="About Nevada Hotels & Suites story section" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="relative border-t border-border p-6 sm:p-10 lg:p-14">
          <div className="text-xs font-semibold tracking-[0.2em] text-gold">WEBSITE FEATURES</div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`rounded-2xl border border-border bg-background/70 p-5 shadow-card backdrop-blur-xl transition-all duration-700 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-gold ${
                  seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${100 + i * 60}ms` }}
              >
                <f.icon className="h-5 w-5 text-gold" />
                <div className="mt-3 font-semibold text-sm">{f.title}</div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.copy}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="relative border-t border-border bg-ink p-6 sm:p-10 lg:p-14 text-ink-foreground">
          <div className="text-xs font-semibold tracking-[0.2em] text-gold">PROJECT HIGHLIGHTS</div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((h, i) => (
              <div
                key={h}
                className={`flex items-center gap-3 rounded-2xl border border-gold/20 bg-ink-foreground/5 px-5 py-4 backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:border-gold/50 ${
                  seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${100 + i * 80}ms` }}
              >
                <Sparkles className="h-4 w-4 shrink-0 text-gold" />
                <span className="text-sm font-medium">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
