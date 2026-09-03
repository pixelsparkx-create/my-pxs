import { Briefcase, Users, Timer, ShieldCheck } from "lucide-react";

const stats = [
  { icon: Briefcase, value: "5+", label: "Projects Completed" },
  { icon: Users, value: "3+", label: "Happy Clients" },
  { icon: Timer, value: "Fast", label: "Delivery", gold: true },
  { icon: ShieldCheck, value: "100%", label: "Client Satisfaction", gold: true },
];

export function Stats() {
  return (
    <div className="rounded-3xl bg-ink text-ink-foreground p-8 lg:p-10 shadow-card relative overflow-hidden">
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="mx-auto h-10 w-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center mb-4">
              <s.icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
            </div>
            <div className={`text-3xl lg:text-4xl font-bold ${s.gold ? "text-gold" : ""}`}>{s.value}</div>
            <div className="text-xs text-ink-foreground/60 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
