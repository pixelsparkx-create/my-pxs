import { MessageSquare, PencilRuler, Code, PackageCheck, ArrowRight } from "lucide-react";

const steps = [
  { icon: MessageSquare, title: "Discuss", desc: "You tell me what you need." },
  { icon: PencilRuler, title: "Plan", desc: "I plan the structure and design." },
  { icon: Code, title: "Build", desc: "I bring your idea to life." },
  { icon: PackageCheck, title: "Deliver", desc: "You review and I deliver final files." },
];

export function Process() {
  return (
    <div className="rounded-3xl bg-card border border-border p-8 lg:p-12 shadow-card">
      <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">MY PROCESS</div>
      <h2 className="text-2xl lg:text-3xl font-bold mb-10">Simple. Clear. Effective.</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((s, i) => (
          <div key={s.title} className="relative">
            <div className="h-12 w-12 rounded-xl border border-gold/40 bg-gold/5 flex items-center justify-center mb-4">
              <s.icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
            </div>
            <div className="font-bold mb-1">{i + 1}. {s.title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            {i < steps.length - 1 && (
              <ArrowRight className="hidden lg:block absolute top-3 -right-3 h-4 w-4 text-gold/50" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
