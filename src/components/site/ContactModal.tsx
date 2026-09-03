import { useEffect, useState } from "react";
import { MessageCircle, Mail, X, Loader2, Sparkles } from "lucide-react";
import { openWhatsApp, openEmail } from "@/lib/contact";

type Props = {
  open: boolean;
  plan: string;
  onClose: () => void;
};

export function ContactModal({ open, plan, onClose }: Props) {
  const [loading, setLoading] = useState<null | "wa" | "email">(null);

  useEffect(() => {
    if (!open) setLoading(null);
    if (open) {
      try {
        localStorage.setItem("pixelspark.selectedPlan", plan);
      } catch {}
    }
  }, [open, plan]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const proceed = (channel: "wa" | "email") => {
    setLoading(channel);
    setTimeout(() => {
      if (channel === "wa") openWhatsApp(plan);
      else openEmail(plan);
      setTimeout(() => {
        onClose();
      }, 600);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/60 backdrop-blur-md"
      />
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-gold/30 p-8 shadow-gold animate-scale-in">
        <div className="absolute -inset-px rounded-3xl bg-gradient-gold opacity-20 blur-xl -z-10" />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-gold flex items-center justify-center mb-4 shadow-gold">
            <Sparkles className="h-6 w-6 text-ink" />
          </div>
          <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-2">{plan.toUpperCase()}</div>
          <h3 className="text-2xl font-bold mb-2">How would you like to continue?</h3>
          <p className="text-sm text-muted-foreground mb-7">
            Choose your preferred channel — your message will be pre-filled and ready to send.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="h-8 w-8 text-gold animate-spin" />
            <p className="text-sm text-muted-foreground">Preparing your project request…</p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => proceed("wa")}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink px-6 py-3.5 rounded-full font-semibold shadow-gold hover:scale-[1.02] transition-transform"
            >
              <MessageCircle className="h-4 w-4" />
              Continue on WhatsApp
            </button>
            <button
              onClick={() => proceed("email")}
              className="w-full inline-flex items-center justify-center gap-2 bg-ink text-ink-foreground px-6 py-3.5 rounded-full font-semibold hover:bg-ink/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Continue via Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
