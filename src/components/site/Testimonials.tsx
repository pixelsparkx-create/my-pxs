import { useEffect, useState, useRef, FormEvent } from "react";
import { Quote, Star, BadgeCheck, Plus, X, Loader2, Check, Link2 } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function ShareReviewLink() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/reviews`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    toast.success("Review link copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/70 hover:text-gold transition-colors border border-border hover:border-gold/40 rounded-full px-3 py-1.5"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-gold" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Share Review Link"}
    </button>
  );
}


type Testimonial = {
  id: string;
  display_name: string;
  title: string;
  rating: number;
  message: string;
};

const submitSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your name").max(100),
  title: z.string().trim().min(2, "Add a title or role").max(100),
  rating: z.number().min(1).max(5),
  message: z.string().trim().min(10, "Tell us a bit more").max(1000),
});

function anonymize(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase() + ".Anon";
  const first = parts[0][0].toUpperCase();
  const last = parts[parts.length - 1];
  return `${first}.${last.charAt(0).toUpperCase()}${last.slice(1)}`;
}

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={onChange ? "button" : undefined}
          onClick={() => onChange?.(n)}
          className={`transition-transform ${onChange ? "hover:scale-125" : ""}`}
          aria-label={`${n} star`}
        >
          <Star
            className={`h-5 w-5 ${n <= value ? "fill-gold text-gold" : "text-muted-foreground/40"}`}
          />
        </button>
      ))}
    </div>
  );
}

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [showForm, setShowForm] = useState(false);
  const autoplay = useRef(Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: false, align: "start" }, [autoplay.current]);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("testimonials")
      .select("id, display_name, title, rating, message")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (mounted && data) setItems(data);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div id="reviews" className="scroll-mt-28 rounded-3xl bg-card border border-border p-8 lg:p-10 shadow-card">
      <span id="testimonials" className="block scroll-mt-28" aria-hidden="true" />
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">WHAT CLIENTS SAY</div>
          <h2 className="text-2xl lg:text-3xl font-bold">
            Words From People<br />I've Worked With
          </h2>
        </div>
        <div className="shrink-0 flex flex-row sm:flex-col flex-wrap items-start sm:items-end gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-foreground transition-colors border border-gold/30 hover:border-gold rounded-full px-3 py-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Share yours
          </button>
          <ShareReviewLink />
        </div>
      </div>


      <div ref={emblaRef} className="overflow-hidden -mx-2">
        <div className="flex">
          {items.map((t) => (
            <div key={t.id} className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_85%] px-2">
              <div className="rounded-2xl border border-border bg-background p-6 h-full">
                <div className="flex items-start justify-between mb-3">
                  <Quote className="h-8 w-8 text-gold" strokeWidth={1.5} />
                  <Stars value={t.rating} />
                </div>
                <p className="text-foreground/80 leading-relaxed italic min-h-[80px]">"{t.message}"</p>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{t.display_name}</div>
                    <div className="text-xs text-muted-foreground">{t.title}</div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-gold uppercase tracking-wider">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && <SubmitForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function SubmitForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = submitSchema.safeParse({ full_name: name, title, rating, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("testimonials").insert({
      full_name: parsed.data.full_name,
      display_name: anonymize(parsed.data.full_name),
      title: parsed.data.title,
      rating: parsed.data.rating,
      message: parsed.data.message,
      approved: false,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit. Try again.");
      return;
    }
    toast.success("Thanks! Your testimonial is pending review.");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/60 backdrop-blur-md" />
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md rounded-3xl bg-card border border-gold/30 p-7 shadow-gold animate-scale-in"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-xl font-bold mb-1">Share your experience</h3>
        <p className="text-xs text-muted-foreground mb-5">
          Your full name will be shown anonymized (e.g. J.Doe). Submissions are reviewed before publishing.
        </p>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            maxLength={100}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Role / business (e.g. Lagos Hotel Owner)"
            maxLength={100}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
          />
          <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5">
            <span className="text-sm text-muted-foreground">Rating</span>
            <Stars value={rating} onChange={setRating} />
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your testimonial…"
            rows={4}
            maxLength={1000}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink px-6 py-3 rounded-full font-semibold shadow-gold hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit testimonial"}
          </button>
        </div>
      </form>
    </div>
  );
}
