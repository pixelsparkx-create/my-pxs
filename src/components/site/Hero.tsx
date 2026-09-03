import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle, Zap, Palette, Smartphone, Target, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import mohammed from "@/assets/mohammed.png";
import { whatsappLink } from "@/lib/contact";

const badges = [
  { icon: Zap, label: "Fast Delivery" },
  { icon: Palette, label: "Modern Design" },
  { icon: Smartphone, label: "Mobile Friendly" },
  { icon: Target, label: "Client Focused" },
];

const phrases = [
  "Building websites for hotels…",
  "Building apps for startups…",
  "Building digital experiences…",
  "Crafting premium brands…",
];

function useTyping() {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const current = phrases[i];
    const speed = del ? 35 : 65;
    const t = setTimeout(() => {
      if (!del) {
        const next = current.slice(0, text.length + 1);
        setText(next);
        if (next === current) setTimeout(() => setDel(true), 1400);
      } else {
        const next = current.slice(0, text.length - 1);
        setText(next);
        if (next === "") {
          setDel(false);
          setI((p) => (p + 1) % phrases.length);
        }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [text, del, i]);

  return text;
}

export function Hero() {
  const typed = useTyping();
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,oklch(0.9_0.08_85/0.45),transparent_55%),radial-gradient(circle_at_10%_80%,oklch(0.9_0.08_85/0.25),transparent_45%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-12 lg:pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-7 animate-fade-in">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-gold">
            <Sparkles className="h-4 w-4" />
            HELLO, I'M <span className="text-foreground">MOHAMMED</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-balance">
            I build websites, apps &{" "}
            <span className="bg-gradient-gold bg-clip-text text-transparent">digital experiences</span>{" "}
            that drive results.
          </h1>
          <div className="text-lg text-foreground/70 font-medium h-7">
            <span className="text-gold">›</span> {typed}
            <span className="inline-block w-0.5 h-5 bg-gold align-middle ml-1 animate-pulse" />
          </div>
          <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
            I help businesses and brands stand out online with modern, high-performing websites,
            apps and creative digital solutions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/portfolio"
              className="group inline-flex items-center gap-2 bg-gradient-gold text-ink px-7 py-3.5 rounded-full font-semibold shadow-gold hover:scale-[1.03] transition-transform"
            >
              View My Work
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href={whatsappLink("General Inquiry")}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 bg-ink text-ink-foreground px-7 py-3.5 rounded-full font-semibold hover:bg-ink/90 transition-colors"
            >
              Let's Work Together
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-3 pt-2">
            {badges.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-sm text-foreground/80">
                <span className="h-8 w-8 rounded-full border border-gold/40 bg-gold/5 flex items-center justify-center">
                  <b.icon className="h-4 w-4 text-gold" />
                </span>
                {b.label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.9_0.1_85/0.55),transparent_60%)] blur-2xl animate-pulse" />
          <div className="relative aspect-[4/5] max-w-md mx-auto">
            <img
              src={mohammed}
              alt="Mohammed, founder of PixelSpark"
              width={720}
              height={895}
              className="relative z-10 w-full h-full object-contain object-bottom drop-shadow-2xl"
            />
            <div className="absolute top-8 -right-4 lg:right-0 z-20 text-right">
              <div className="font-script text-4xl text-foreground leading-none">Mohammed</div>
              <div className="mt-2 text-[11px] tracking-[0.2em] font-semibold text-muted-foreground">
                FOUNDER OF <span className="text-gold">PIXELSPARK</span>
              </div>
            </div>
            <div className="absolute bottom-12 -left-2 lg:left-0 z-20 bg-ink/90 backdrop-blur text-ink-foreground rounded-2xl px-5 py-4 shadow-card max-w-[240px] border border-white/10">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="h-4 w-4 text-gold" />
                <span className="font-semibold">Turning Ideas Into</span>
              </div>
              <div className="text-sm font-semibold mt-1">Powerful Digital Products.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
