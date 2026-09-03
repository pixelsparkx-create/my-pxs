import { Check, Sparkles, Crown, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ContactModal } from "./ContactModal";

const plans = [
  {
    name: "Starter",
    sub: "Landing Page",
    price: "₦25,000",
    desc: "Perfect for small businesses getting online.",
    features: ["1-page landing site", "Mobile responsive", "Contact form", "Basic SEO"],
    badge: null,
    highlight: false,
  },
  {
    name: "Growth",
    sub: "Business Website",
    price: "₦60,000",
    desc: "More pages, features and functionality.",
    features: ["Up to 5 pages", "Custom design", "Booking / forms", "On-page SEO", "1 month support"],
    badge: "Most Popular",
    badgeIcon: Sparkles,
    highlight: true,
  },
  {
    name: "Premium",
    sub: "Complete Solution",
    price: "₦100,000",
    desc: "Advanced features and custom solutions.",
    features: ["Unlimited pages", "Web app / dashboard", "Integrations", "Priority delivery", "3 months support"],
    badge: "Best Value",
    badgeIcon: Crown,
    highlight: false,
  },
];

export function Pricing() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div id="pricing" className="rounded-3xl bg-card border border-border p-8 lg:p-12 shadow-card">
      <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">PRICING PACKAGES</div>
      <h2 className="text-2xl lg:text-3xl font-bold mb-10">Simple Packages, Real Value</h2>
      <div className="grid sm:grid-cols-3 gap-5">
        {plans.map((p) => {
          const BadgeIcon = p.badgeIcon;
          return (
            <div
              key={p.name}
              className={`group relative rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 ${
                p.highlight
                  ? "bg-background border-2 border-gold shadow-gold lg:scale-[1.03]"
                  : "bg-background border border-border hover:border-gold/60 hover:shadow-gold"
              }`}
            >
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-gold opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500" />
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-ink text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-gold">
                  {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                  {p.badge}
                </div>
              )}
              <div className="relative">
                <div className="font-bold text-lg">{p.name}</div>
                <div className="text-xs text-muted-foreground mb-4">{p.sub}</div>
                <div className="text-3xl lg:text-4xl font-bold mb-1 bg-gradient-gold bg-clip-text text-transparent">
                  {p.price}
                </div>
                <p className="text-xs text-muted-foreground mb-5">{p.desc}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-gold shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelected(p.name)}
                  className={`block w-full text-center py-2.5 rounded-full text-sm font-semibold transition-all ${
                    p.highlight
                      ? "bg-gradient-gold text-ink hover:scale-[1.02] shadow-gold"
                      : "border border-border hover:border-gold hover:text-gold hover:bg-gold/5"
                  }`}
                >
                  Choose Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <Link
          to="/pricing-guide"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all"
        >
          See exactly what's included & what can affect your final price <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ContactModal open={!!selected} plan={selected ?? ""} onClose={() => setSelected(null)} />
    </div>
  );
}
