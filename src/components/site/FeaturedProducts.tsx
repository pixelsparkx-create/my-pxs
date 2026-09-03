import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ExternalLink, Sparkles, Play } from "lucide-react";
import shot1 from "@/assets/bluerush-223505.png.asset.json";
import shot2 from "@/assets/bluerush-223532.png.asset.json";
import shot3 from "@/assets/bluerush-223641.png.asset.json";
import {
  BLUERUSH_URL,
  EMOJI_FORGE_URL,
  DEENLY_URL,
  emojiForgeShots,
  deenlyShots,
} from "@/lib/projects";

const PROJECT_URL = BLUERUSH_URL;



const features = [
  "Daily weather forecasts",
  "Rideability Score",
  "Smart ride planning",
  "Clean modern UI",
  "Weather-based recommendations",
  "Mobile-first experience",
];

const tech = ["Weather APIs", "Maps Integration", "Modern UI/UX", "Mobile Development"];

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setSeen(true),
      { threshold: 0, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, seen };
}

function RideabilityGauge({ active }: { active: boolean }) {
  const score = 92;
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="rounded-2xl border border-gold/25 bg-background/80 backdrop-blur-xl p-4 shadow-gold w-[210px]">
      <div className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
        Rideability Score
      </div>
      <div className="mt-3 flex items-center gap-3">
        <svg viewBox="0 0 80 80" className="h-16 w-16 shrink-0 -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="stroke-border" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            className="stroke-gold"
            style={{
              strokeDasharray: c,
              strokeDashoffset: active ? c - (c * score) / 100 : c,
              transition: "stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </svg>
        <div className="min-w-0">
          <div className="text-2xl font-bold leading-none">
            {score}
            <span className="text-sm text-muted-foreground"> / 100</span>
          </div>
          <div className="mt-1 text-[11px] text-foreground/70 leading-snug">
            Excellent riding conditions
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedProducts() {
  const { ref, seen } = useInView<HTMLDivElement>();

  return (
    <section id="products" ref={ref} className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
      <div className="mb-12">
        <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">
          FEATURED PRODUCTS
        </div>
        <h2 className="text-3xl lg:text-5xl font-bold">Featured Products</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Real digital products built to solve real-world problems.
        </p>
      </div>

      <div
        className={`relative overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-700 hover:shadow-gold hover:-translate-y-1 ${
          seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative grid lg:grid-cols-2 gap-10 p-6 sm:p-10 lg:p-14">
          {/* Copy */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-ink text-ink-foreground">
                Mobile App
              </span>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/30 inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" /> Live
              </span>
            </div>

            <h3 className="mt-5 text-4xl lg:text-5xl font-bold font-display tracking-tight">
              BlueRush
            </h3>
            <p className="mt-2 text-lg text-gold font-semibold">Smart Bike Ride Planner</p>

            <p className="mt-5 text-foreground/75 leading-relaxed">
              BlueRush is an intelligent cycling companion that helps riders plan safer and
              smarter rides. It combines daily weather forecasts with a unique Rideability Score
              to help cyclists know the best time to ride.
            </p>
            <p className="mt-3 text-foreground/75 leading-relaxed">
              The app is designed with a clean, modern interface and focuses on making ride
              planning simple, accurate, and enjoyable.
            </p>

            <ul className="mt-7 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {features.map((f, i) => (
                <li
                  key={f}
                  className={`flex items-start gap-2.5 text-sm text-foreground/85 transition-all duration-500 ${
                    seen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                  }`}
                  style={{ transitionDelay: `${150 + i * 70}ms` }}
                >
                  <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-2">
              {tech.map((t) => (
                <span
                  key={t}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={PROJECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-gold text-ink px-6 py-3 rounded-full font-semibold shadow-gold hover:scale-[1.03] transition-transform"
              >
                View Project <ExternalLink className="h-4 w-4" />
              </a>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 bg-ink text-ink-foreground px-6 py-3 rounded-full font-semibold hover:bg-gradient-gold hover:text-ink transition-all"
              >
                See More Products <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Visuals */}
          <div className="relative min-w-0">
            <div
              className={`relative rounded-2xl overflow-hidden border border-border bg-muted shadow-card transition-all duration-1000 ${
                seen ? "opacity-100 translate-y-0 rotate-0" : "opacity-0 translate-y-10 rotate-1"
              }`}
            >
              <div className="flex items-center gap-1.5 px-3 py-2 bg-ink">
                <span className="h-2 w-2 rounded-full bg-ink-foreground/30" />
                <span className="h-2 w-2 rounded-full bg-ink-foreground/30" />
                <span className="h-2 w-2 rounded-full bg-gold/60" />
              </div>
              <img
                src={shot1.url}
                alt="BlueRush weather alerts and riding insights screen"
                loading="lazy"
                className="w-full object-cover"
              />
            </div>

            <div className="relative z-10 -mt-4 sm:-mt-8 sm:ml-8 grid sm:grid-cols-[1.35fr_1fr] gap-4 items-end">
              <div
                className={`rounded-2xl overflow-hidden border border-gold/25 bg-background/70 backdrop-blur-xl shadow-gold transition-all duration-1000 hover:-translate-y-1.5 ${
                  seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: "250ms" }}
              >
                <img
                  src={shot2.url}
                  alt="BlueRush advanced ride analysis screen"
                  loading="lazy"
                  className="w-full object-cover"
                />
              </div>

              <div
                className={`transition-all duration-1000 ${
                  seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: "450ms" }}
              >
                <RideabilityGauge active={seen} />
              </div>
            </div>

            <div
              className={`mt-4 sm:mt-6 sm:mr-10 rounded-2xl overflow-hidden border border-border bg-background/70 backdrop-blur-xl shadow-card transition-all duration-1000 hover:-translate-y-1.5 ${
                seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <img
                src={shot3.url}
                alt="BlueRush choose location screen"
                loading="lazy"
                className="w-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>

      <DeenlyCard />
      <EmojiForgeCard />
    </section>
  );
}

const deenlyFeatures = [
  "Prayer Times",
  "Quran Reader",
  "Daily Verse",
  "Hadith Collection",
  "Ramadan Tracker",
  "Qibla Compass",
  "Islamic Calendar",
  "Prayer Notifications",
  "Cloud Sync",
];

const deenlyTech = [
  "React",
  "Supabase",
  "Location Services",
  "Push Notifications",
  "Responsive Design",
  "Modern UI",
];

function PhoneFrame({
  src,
  alt,
  className = "",
  style,
  accent = "gold",
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  accent?: "gold" | "violet";
}) {
  return (
    <div
      className={`rounded-[1.75rem] border p-1.5 backdrop-blur-xl transition-all duration-1000 hover:-translate-y-1.5 ${
        accent === "gold"
          ? "border-gold/25 bg-background/70 shadow-gold"
          : "border-[oklch(0.62_0.19_295_/_0.3)] bg-background/70 shadow-card"
      } ${className}`}
      style={style}
    >
      <div className="overflow-hidden rounded-[1.4rem] bg-muted">
        <img src={src} alt={alt} loading="lazy" className="w-full object-cover" />
      </div>
    </div>
  );
}

function DeenlyCard() {
  const { ref, seen } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`relative mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-700 hover:shadow-gold hover:-translate-y-1 ${
        seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[oklch(0.62_0.19_295_/_0.22)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative grid lg:grid-cols-2 gap-10 p-6 sm:p-10 lg:p-14">
        {/* Visuals */}
        <div className="relative min-w-0 order-2 lg:order-1">
          <PhoneFrame
            accent="violet"
            src={deenlyShots[0]}
            alt="Deenly prayer times screen"
            className={seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
          />
          <div className="relative z-10 -mt-6 sm:ml-10 grid sm:grid-cols-2 gap-4 items-start">
            <PhoneFrame
              accent="violet"
              src={deenlyShots[1]}
              alt="Deenly morning adhkar screen"
              className={seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
              style={{ transitionDelay: "250ms" }}
            />
            <PhoneFrame
              accent="gold"
              src={deenlyShots[2]}
              alt="Deenly hadith of the day card"
              className={seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
              style={{ transitionDelay: "420ms" }}
            />
          </div>
        </div>

        {/* Copy */}
        <div className="min-w-0 order-1 lg:order-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-ink text-ink-foreground">
              Muslim Companion App
            </span>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/30">
              Faith &amp; Lifestyle
            </span>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/30 inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Completed
            </span>
          </div>

          <h3 className="mt-5 text-4xl lg:text-5xl font-bold font-display tracking-tight">
            Deenly
          </h3>
          <p className="mt-2 text-lg text-gold font-semibold">Your Daily Muslim Companion.</p>

          <p className="mt-5 text-foreground/75 leading-relaxed">
            Deenly is a beautifully designed Muslim companion application that helps Muslims stay
            connected with their faith every day.
          </p>
          <p className="mt-3 text-foreground/75 leading-relaxed">
            It combines essential Islamic tools into one modern experience, making daily worship,
            learning, and spiritual growth easier and more accessible.
          </p>

          <ul className="mt-7 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {deenlyFeatures.map((f, i) => (
              <li
                key={f}
                className={`flex items-start gap-2.5 text-sm text-foreground/85 transition-all duration-500 ${
                  seen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                }`}
                style={{ transitionDelay: `${150 + i * 70}ms` }}
              >
                <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-2">
            {deenlyTech.map((t) => (
              <span
                key={t}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={DEENLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-gold text-ink px-6 py-3 rounded-full font-semibold shadow-gold hover:scale-[1.03] transition-transform"
            >
              Visit Website <ExternalLink className="h-4 w-4" />
            </a>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 bg-ink text-ink-foreground px-6 py-3 rounded-full font-semibold hover:bg-gradient-gold hover:text-ink transition-all"
            >
              Learn More <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const forgeFeatures = [
  "Strategic Turn-Based Battles",
  "Hundreds of Unique Emojis",
  "Upgrade & Evolution System",
  "Boss Battles",
  "Multiple Worlds",
  "Team Building",
  "Daily Rewards",
  "Live Events",
  "Beautiful Cartoon Art Style",
  "Mobile Optimized",
];

const forgeTech = [
  "Game Design",
  "Game Development",
  "Mobile Game",
  "UI Design",
  "Animation",
  "Interactive Systems",
];

function EmojiForgeCard() {
  const { ref, seen } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`relative mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-700 hover:shadow-gold hover:-translate-y-1 ${
        seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative grid lg:grid-cols-2 gap-10 p-6 sm:p-10 lg:p-14">
        {/* Copy */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-ink text-ink-foreground">
              Mobile Game
            </span>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/30 inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" /> In Development
            </span>
          </div>

          <h3 className="mt-5 text-4xl lg:text-5xl font-bold font-display tracking-tight">
            Emoji Forge
          </h3>
          <p className="mt-2 text-lg text-gold font-semibold">
            Forge Your Team. Master Every Battle.
          </p>

          <p className="mt-5 text-foreground/75 leading-relaxed">
            Emoji Forge is a strategic turn-based mobile battle game where players collect,
            upgrade, and command powerful emojis, each with their own abilities, personalities,
            strengths, and battle styles.
          </p>
          <p className="mt-3 text-foreground/75 leading-relaxed">
            Build the perfect squad, battle through exciting worlds, defeat powerful bosses,
            unlock rare characters, and uncover the mysteries of the Emoji Universe — with
            cinematic combat, deep progression systems and live events.
          </p>

          <ul className="mt-7 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {forgeFeatures.map((f, i) => (
              <li
                key={f}
                className={`flex items-start gap-2.5 text-sm text-foreground/85 transition-all duration-500 ${
                  seen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                }`}
                style={{ transitionDelay: `${150 + i * 70}ms` }}
              >
                <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-2">
            {forgeTech.map((t) => (
              <span
                key={t}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={EMOJI_FORGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-gold text-ink px-6 py-3 rounded-full font-semibold shadow-gold hover:scale-[1.03] transition-transform"
            >
              Play Demo <Play className="h-4 w-4" />
            </a>
            <a
              href={EMOJI_FORGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-ink text-ink-foreground px-6 py-3 rounded-full font-semibold hover:bg-gradient-gold hover:text-ink transition-all"
            >
              View Project <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Visuals */}
        <div className="relative min-w-0">
          <PhoneFrame
            src={emojiForgeShots[1]}
            alt="Emoji Forge turn-based battle screen"
            className={seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
          />
          <div className="relative z-10 -mt-6 sm:mr-8 grid sm:grid-cols-2 gap-4 items-start">
            <PhoneFrame
              src={emojiForgeShots[0]}
              alt="Emoji Forge home screen with events and rewards"
              className={seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
              style={{ transitionDelay: "250ms" }}
            />
            <div className="grid gap-4">
              <PhoneFrame
                src={emojiForgeShots[2]}
                alt="Emoji Forge summon packs screen"
                className={seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
                style={{ transitionDelay: "400ms" }}
              />
              <PhoneFrame
                src={emojiForgeShots[3]}
                alt="Emoji Forge achievements screen"
                className={seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
                style={{ transitionDelay: "550ms" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

