import { Zap, Sparkles, Smartphone, TrendingUp, Film, Handshake } from "lucide-react";

const items = [
  { icon: Zap, title: "Fast Delivery", desc: "Tight timelines without cutting corners." },
  { icon: Sparkles, title: "Premium Designs", desc: "Pixel-perfect, luxury aesthetic." },
  { icon: Smartphone, title: "Mobile Optimized", desc: "Smooth on every screen size." },
  { icon: TrendingUp, title: "Business Focused", desc: "Built to convert visitors into customers." },
  { icon: Film, title: "Modern Animations", desc: "Cinematic motion, never gimmicky." },
  { icon: Handshake, title: "Direct Communication", desc: "Talk to me, not a middleman." },
];

export function Trust() {
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
      <div className="text-center mb-12">
        <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">WHY CHOOSE PIXELSPARK</div>
        <h2 className="text-3xl lg:text-5xl font-bold">Why Businesses Choose Me</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((it) => (
          <div
            key={it.title}
            className="group relative rounded-2xl bg-card border border-border p-6 hover:border-gold/50 hover:-translate-y-1 transition-all duration-500 shadow-card hover:shadow-gold"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-gold opacity-0 group-hover:opacity-[0.04] transition-opacity" />
            <div className="h-12 w-12 rounded-xl border border-gold/30 bg-gold/10 flex items-center justify-center mb-4">
              <it.icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-lg mb-1">{it.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
