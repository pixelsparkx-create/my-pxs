import { useState } from "react";
import {
  Globe,
  Smartphone,
  Gamepad2,
  Palette,
  Hotel,
  Megaphone,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

const services = [
  {
    icon: Globe,
    title: "Website Development",
    desc: "High-performance business websites that convert visitors into customers.",
    tech: ["React", "Next.js", "Tailwind"],
    timeline: "1–2 weeks",
    ideal: "Brands needing a premium online presence",
  },
  {
    icon: Hotel,
    title: "Hotel Booking Websites",
    desc: "Beautiful booking platforms with availability, payments and dashboards.",
    tech: ["React", "Supabase", "Stripe"],
    timeline: "2–4 weeks",
    ideal: "Hotels, lodges, short-let owners",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "Beautiful, fast and user-friendly mobile applications.",
    tech: ["React Native", "Expo", "Firebase"],
    timeline: "3–6 weeks",
    ideal: "Startups with mobile-first products",
  },
  {
    icon: Palette,
    title: "UI / UX Design",
    desc: "Polished, conversion-focused interfaces that feel premium.",
    tech: ["Figma", "Prototyping"],
    timeline: "1–2 weeks",
    ideal: "Founders refining their product",
  },
  {
    icon: Gamepad2,
    title: "Game Development",
    desc: "Fun, engaging and optimized 2D games for web and mobile.",
    tech: ["Unity", "Godot", "JS"],
    timeline: "4–8 weeks",
    ideal: "Indies and creative brands",
  },
  {
    icon: Megaphone,
    title: "Brand Digital Presence",
    desc: "Landing pages, portfolios and content systems that build authority.",
    tech: ["Webflow", "React", "SEO"],
    timeline: "1–2 weeks",
    ideal: "Personal brands and creators",
  },
];

export function Services() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="services" className="px-6 lg:px-10 py-12">
      <div className="mx-auto max-w-7xl bg-ink text-ink-foreground rounded-3xl p-8 lg:p-14 grid lg:grid-cols-5 gap-10 shadow-card relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-gold/5 blur-3xl" />
        <div className="lg:col-span-2 relative">
          <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-4">WHAT I DO</div>
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
            Digital Solutions<br />That Help You <span className="text-gold">Grow</span>
          </h2>
          <p className="mt-5 text-ink-foreground/70 leading-relaxed">
            I design and build modern websites, apps and game experiences that help businesses
            attract customers, build trust and grow faster. Tap any service to expand.
          </p>
          <Link
            to="/services"
            className="mt-8 inline-flex items-center gap-2 bg-gradient-gold text-ink px-6 py-3 rounded-full font-semibold text-sm hover:scale-[1.03] transition-transform shadow-gold"
          >
            Explore Services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="lg:col-span-3 relative space-y-3">
          {services.map((s, i) => {
            const isOpen = open === i;
            return (
              <button
                key={s.title}
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full text-left rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:border-gold/40 hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl border border-gold/30 bg-gold/10 flex items-center justify-center shrink-0">
                    <s.icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{s.title}</h3>
                    <p className="text-xs text-ink-foreground/60 mt-0.5">{s.desc}</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gold shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
                <div
                  className={`grid transition-all duration-500 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="grid sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-white/10">
                      <div>
                        <div className="text-gold font-semibold mb-1 uppercase tracking-wider">Tech</div>
                        <div className="text-ink-foreground/70">{s.tech.join(" · ")}</div>
                      </div>
                      <div>
                        <div className="text-gold font-semibold mb-1 uppercase tracking-wider">Timeline</div>
                        <div className="text-ink-foreground/70">{s.timeline}</div>
                      </div>
                      <div>
                        <div className="text-gold font-semibold mb-1 uppercase tracking-wider">Ideal for</div>
                        <div className="text-ink-foreground/70">{s.ideal}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
