import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  FileText,
  Download,
  Check,
  MessageCircle,
  Mail,
  Linkedin,
  ArrowLeft,
  RotateCcw,
  Mic,
  MicOff,
  Copy,
  ChevronDown,
  FileDown,
} from "lucide-react";
import {
  mergeBrief,
  submitBrief,
  goldieWhatsAppMessage,
  goldieWhatsAppLink,
  goldieEmailLink,
  STORAGE_KEY,
  type GoldieBrief,
} from "@/lib/goldie/brief";
import { downloadProposal } from "@/lib/goldie/proposal";
import { downloadTranscript, transcriptFileName, type TranscriptMessage } from "@/lib/transcript";
import { GOLDIE_HANDOFF_KEY } from "@/lib/plan/api";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { LINKEDIN_URL } from "@/lib/contact";
import { toast } from "sonner";

const QUICK_STARTS = [
  "🚀 I need a website",
  "📱 I need an app",
  "💰 Help me understand pricing",
  "🎨 Help me design my website",
  "🧠 I'm not sure what I need",
];

const GREETING: UIMessage = {
  id: "goldie-greeting",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: `Hey 👋 I'm **Goldie**, PixelSpark's AI business assistant.\n\nTell me what you're trying to build and I'll help you figure out the right website, features, design direction and estimated budget.\n\nWhat are you working on?`,
    },
  ],
};

type Persisted = { messages: UIMessage[] };

function loadPersisted(): Persisted {
  if (typeof window === "undefined") return { messages: [GREETING] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { messages: [GREETING] };
    const parsed = JSON.parse(raw) as Persisted;
    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) return { messages: [GREETING] };
    return { messages: parsed.messages };
  } catch {
    return { messages: [GREETING] };
  }
}

export function Goldie() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [initial, setInitial] = useState<UIMessage[]>([GREETING]);
  const [resumed, setResumed] = useState(false);

  useEffect(() => {
    const loaded = loadPersisted().messages;
    setInitial(loaded);
    setResumed(loaded.length > 1);
    setMounted(true);
  }, []);

  // The pricing guide hands a visitor over to Goldie with their plan context.
  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("pixelspark:open-goldie", onOpen);
    return () => window.removeEventListener("pixelspark:open-goldie", onOpen);
  }, []);

  // Lock the page behind the full-screen mobile panel.
  useEffect(() => {
    if (!open) return;
    const isSmall = window.matchMedia("(max-width: 639px)").matches;
    if (!isSmall) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Goldie" : "Chat with Goldie, PixelSpark's AI assistant"}
        aria-expanded={open}
        className={`fixed bottom-24 right-5 z-[70] group items-center gap-2 rounded-full border border-gold/40 bg-card/95 backdrop-blur px-4 py-3 shadow-card transition-all duration-300 hover:shadow-gold hover:border-gold hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          open ? "hidden sm:inline-flex" : "inline-flex"
        }`}
      >
        <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-gold text-ink">
          {!open && (
            <span className="absolute inset-0 rounded-full bg-gold/50 goldie-ping" aria-hidden="true" />
          )}
          <span className="relative">
            {open ? (
              <X className="h-3.5 w-3.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-12" strokeWidth={2.2} />
            )}
          </span>
        </span>
        <span className="text-sm font-semibold">{open ? "Close" : resumed ? "Continue with Goldie" : "Ask Goldie"}</span>
      </button>

      {mounted && open && (
        <>
          <div
            className="fixed inset-0 z-[55] bg-ink/40 backdrop-blur-[2px] goldie-fade sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <GoldiePanel initialMessages={initial} onClose={() => setOpen(false)} />
        </>
      )}
    </>
  );
}

/** Rough discovery progress so the visitor can feel the conversation moving forward. */
const PROGRESS_KEYS: (keyof GoldieBrief)[] = [
  "business_name",
  "business_type",
  "target_audience",
  "business_goals",
  "project_type",
  "required_pages",
  "required_features",
  "design_direction",
  "timeline",
  "recommended_plan",
];

function briefProgress(brief: GoldieBrief) {
  const filled = PROGRESS_KEYS.filter((k) => {
    const v = brief[k];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }).length;
  return Math.round((filled / PROGRESS_KEYS.length) * 100);
}

function GoldiePanel({
  initialMessages,
  onClose,
}: {
  initialMessages: UIMessage[];
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [view, setView] = useState<"chat" | "review" | "sent">("chat");
  const [manual, setManual] = useState<GoldieBrief>({});
  const [atBottom, setAtBottom] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/goldie" }), []);
  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: "goldie",
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "Goldie couldn't respond. Please try again."),
  });

  const busy = status === "submitted" || status === "streaming";

  // Prefill from the pricing guide handoff so the visitor never repeats themselves.
  const handoffSent = useRef(false);
  useEffect(() => {
    if (handoffSent.current) return;
    let text: string | null = null;
    try {
      text = window.localStorage.getItem(GOLDIE_HANDOFF_KEY);
      if (text) window.localStorage.removeItem(GOLDIE_HANDOFF_KEY);
    } catch {
      /* private mode — no handoff available */
    }
    if (!text) return;
    handoffSent.current = true;
    void sendMessage({ text });
  }, [sendMessage]);

  // Persist the single ongoing conversation.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages }));
    } catch {
      /* storage full or blocked — chat still works in-session */
    }
  }, [messages]);

  // Only auto-scroll when the visitor is already following the conversation.
  useLayoutEffect(() => {
    if (!atBottom) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status, view, atBottom]);

  useEffect(() => {
    if (view === "chat" && !busy) inputRef.current?.focus();
  }, [view, busy]);

  // Auto-grow the composer.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [input]);

  // Escape closes (or steps back from a sub-view).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (view !== "chat") setView("chat");
      else onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, onClose]);

  // Derive the structured project brief from every update_brief tool call.
  const brief = useMemo(() => {
    let acc: GoldieBrief = {};
    for (const m of messages) {
      for (const part of m.parts ?? []) {
        if (part.type === "tool-update_brief") {
          const input = (part as { input?: Partial<GoldieBrief> }).input;
          if (input && typeof input === "object") acc = mergeBrief(acc, input);
        }
      }
    }
    return mergeBrief(acc, manual);
  }, [messages, manual]);

  const progress = briefProgress(brief);

  const voiceBaseRef = useRef("");
  const voice = useVoiceInput(
    useCallback((text: string, final: boolean) => {
      setInput((prev) => {
        const base = final ? prev : voiceBaseRef.current;
        const next = `${base}${base && !base.endsWith(" ") ? " " : ""}${text}`;
        if (final) voiceBaseRef.current = next;
        return next;
      });
    }, []),
  );

  useEffect(() => {
    if (voice.listening) voiceBaseRef.current = input;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.listening]);

  useEffect(() => {
    if (voice.error) toast.error(voice.error);
  }, [voice.error]);

  // Clickable follow-up suggestions from the most recent assistant turn.
  const suggestions = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      if (m.role === "user") return [];
      for (const part of m.parts ?? []) {
        if (part.type === "tool-suggest_replies") {
          const list = (part as { input?: { suggestions?: unknown } }).input?.suggestions;
          if (Array.isArray(list)) return list.map(String).filter(Boolean).slice(0, 4);
        }
      }
    }
    return [];
  }, [messages]);

  const send = useCallback(
    (text: string) => {
      const value = text.trim();
      if (!value || busy) return;
      setInput("");
      voiceBaseRef.current = "";
      if (voice.listening) voice.toggle();
      setAtBottom(true);
      void sendMessage({ text: value });
    },
    [busy, sendMessage, voice],
  );

  const transcriptMessages: TranscriptMessage[] = useMemo(
    () =>
      messages
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          text: (m.parts ?? []).map((p) => (p.type === "text" ? p.text : "")).join("").trim(),
        }))
        .filter((m) => m.text.length > 0),
    [messages],
  );

  function exportConversation() {
    if (transcriptMessages.length <= 1) {
      toast.error("Have a chat with Goldie first — there's nothing to export yet.");
      return;
    }
    const sessionId = getSessionId();
    const ok = downloadTranscript({ brief, messages: transcriptMessages, type: "client", sessionId });
    if (!ok) {
      toast.error("Allow pop-ups to export your conversation.");
      return;
    }
    void supabase
      .from("transcript_exports")
      .insert({
        goldie_session_id: sessionId,
        format: "pdf",
        export_type: "client",
        filename: transcriptFileName(brief, "client"),
      })
      .then(() => undefined, () => undefined);
  }

  function resetConversation() {
    if (messages.length > 1 && !window.confirm("Start a fresh conversation with Goldie? This clears the current one.")) {
      return;
    }
    setMessages([GREETING]);
    setManual({});
    setInput("");
    setView("chat");
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Goldie, PixelSpark AI business assistant"
      className="fixed inset-x-0 bottom-0 top-0 sm:inset-auto sm:bottom-24 sm:right-5 z-[60] sm:w-[420px] sm:max-h-[calc(100vh-9rem)] flex flex-col bg-card sm:rounded-3xl border border-border shadow-card overflow-hidden goldie-panel-in"
    >
      <header className="relative shrink-0 border-b border-border px-4 pt-3 pb-2.5 bg-gradient-ink text-background">
        <div className="flex items-center gap-3">
          <span className="relative h-9 w-9 rounded-full bg-gradient-gold text-ink grid place-items-center shadow-gold">
            <Sparkles className="h-4 w-4" strokeWidth={2.2} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink bg-emerald-400" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold leading-tight tracking-tight">Goldie</div>
            <div className="text-[11px] opacity-70 truncate">
              {busy ? "Typing…" : "PixelSpark AI Business Assistant"}
            </div>
          </div>
          <button
            onClick={exportConversation}
            aria-label="Export conversation"
            title="Export conversation (PDF)"
            className="p-2 rounded-full opacity-70 hover:opacity-100 hover:bg-background/10 transition-colors"
          >
            <FileDown className="h-4 w-4" />
          </button>
          <button
            onClick={resetConversation}
            aria-label="Start over"
            title="Start over"
            className="p-2 rounded-full opacity-70 hover:opacity-100 hover:bg-background/10 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            aria-label="Close Goldie"
            title="Close"
            className="p-2 rounded-full opacity-70 hover:opacity-100 hover:bg-background/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {progress > 0 && (
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1 flex-1 rounded-full bg-background/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-gold transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(progress, 6)}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums opacity-70">{progress}% discovered</span>
          </div>
        )}
      </header>

      {view === "chat" && (
        <>
          <div
            ref={scrollRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
            }}
            className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3.5 scroll-smooth"
          >
            {messages.map((m, i) => (
              <Bubble
                key={m.id}
                message={m}
                streaming={status === "streaming" && i === messages.length - 1 && m.role === "assistant"}
              />
            ))}

            {status === "submitted" && (
              <div className="flex items-end gap-2 goldie-fade">
                <span className="h-6 w-6 shrink-0 rounded-full bg-gradient-gold text-ink grid place-items-center">
                  <Sparkles className="h-3 w-3" strokeWidth={2.4} />
                </span>
                <div className="rounded-2xl rounded-bl-sm border border-border bg-background px-3.5 py-3 flex items-center gap-1">
                  <span className="goldie-dot h-1.5 w-1.5 rounded-full bg-gold" />
                  <span className="goldie-dot h-1.5 w-1.5 rounded-full bg-gold [animation-delay:0.15s]" />
                  <span className="goldie-dot h-1.5 w-1.5 rounded-full bg-gold [animation-delay:0.3s]" />
                </div>
              </div>
            )}

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_STARTS.map((q, i) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className="goldie-rise rounded-full border border-border px-3 py-1.5 text-xs transition-all hover:border-gold hover:text-gold hover:-translate-y-0.5 active:scale-95"
                  >
                    {q}
                  </button>
                ))}
                <a
                  href={goldieWhatsAppLink("Hello Mohammed 👋 I'd like to talk about a project.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ animationDelay: `${QUICK_STARTS.length * 60}ms` }}
                  className="goldie-rise rounded-full border border-border px-3 py-1.5 text-xs transition-all hover:border-gold hover:text-gold hover:-translate-y-0.5"
                >
                  💬 Talk to PixelSpark
                </a>
              </div>
            )}

            {!busy && messages.length > 1 && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{ animationDelay: `${i * 70}ms` }}
                    className="goldie-rise rounded-full border border-gold/40 bg-gold/5 px-3 py-1.5 text-xs text-gold transition-all hover:bg-gold/15 hover:-translate-y-0.5 active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-xs text-destructive">
                Goldie hit a snag. Try again, or{" "}
                <a
                  className="underline underline-offset-2"
                  href={goldieWhatsAppLink("Hello Mohammed 👋 I'd like to talk about a project.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  reach PixelSpark on WhatsApp
                </a>
                .
              </div>
            )}
          </div>

          {!atBottom && (
            <button
              onClick={() => {
                setAtBottom(true);
                scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
              }}
              aria-label="Scroll to latest message"
              className="absolute bottom-24 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full border border-gold/40 bg-card text-gold grid place-items-center shadow-card goldie-fade"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}

          {brief.ready_for_review && (
            <button
              onClick={() => setView("review")}
              className="goldie-rise mx-3 mb-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold text-ink px-4 py-2.5 text-sm font-semibold shadow-gold transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <FileText className="h-4 w-4" /> Review your project brief
            </button>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="shrink-0 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-end gap-2 bg-card"
          >
            <div
              className={`flex-1 rounded-2xl border bg-background transition-colors ${
                voice.listening ? "border-gold" : "border-border focus-within:border-gold"
              }`}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder={voice.listening ? "Listening… speak now" : "Tell Goldie about your business…"}
                aria-label="Message Goldie"
                className="w-full resize-none max-h-32 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </div>
            {voice.supported && (
              <button
                type="button"
                onClick={voice.toggle}
                aria-label={voice.listening ? "Stop voice input" : "Speak to Goldie"}
                aria-pressed={voice.listening}
                title={voice.listening ? "Stop listening" : "Speak to Goldie"}
                className={`relative h-10 w-10 shrink-0 rounded-full grid place-items-center border transition-colors ${
                  voice.listening
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-border text-muted-foreground hover:border-gold hover:text-gold"
                }`}
              >
                {voice.listening && (
                  <span className="absolute inset-0 rounded-full bg-gold/30 goldie-ping" aria-hidden="true" />
                )}
                <span className="relative">
                  {voice.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </span>
              </button>
            )}
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="h-10 w-10 shrink-0 rounded-full bg-gradient-gold text-ink grid place-items-center shadow-gold transition-all disabled:opacity-40 disabled:shadow-none enabled:hover:-translate-y-0.5 enabled:active:scale-95"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </>
      )}

      {view === "review" && (
        <ReviewBrief
          brief={brief}
          onBack={() => setView("chat")}
          onEdit={(patch) => setManual((prev) => ({ ...prev, ...patch }))}
          onSent={() => setView("sent")}
        />
      )}

      {view === "sent" && <SentView brief={brief} onBack={() => setView("chat")} />}
    </div>
  );
}

function Bubble({ message, streaming }: { message: UIMessage; streaming?: boolean }) {
  const [copied, setCopied] = useState(false);
  const text = (message.parts ?? [])
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
  if (!text) return null;
  const isUser = message.role === "user";

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy that message.");
    }
  }

  if (isUser) {
    return (
      <div className="flex justify-end goldie-rise">
        <div className="max-w-[86%] rounded-2xl rounded-br-sm bg-gradient-gold text-ink px-4 py-2.5 text-sm leading-relaxed font-medium shadow-gold/40">
          <div className="whitespace-pre-wrap break-words">{text}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2 goldie-rise">
      <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-gradient-gold text-ink grid place-items-center">
        <Sparkles className="h-3 w-3" strokeWidth={2.4} />
      </span>
      <div className="min-w-0 max-w-[86%]">
        <div className="rounded-2xl rounded-bl-sm border border-border bg-background px-4 py-2.5 text-sm leading-relaxed break-words">
          <div className="goldie-prose space-y-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:marker:text-gold [&_strong]:font-semibold [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.8em]">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
          {streaming && <span className="goldie-caret ml-0.5 inline-block h-3.5 w-[2px] align-[-2px] bg-gold" />}
        </div>
        {!streaming && (
          <button
            onClick={copy}
            aria-label="Copy Goldie's message"
            className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:text-gold focus-visible:opacity-100 group-hover:opacity-100"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

const REVIEW_FIELDS: { key: keyof GoldieBrief; label: string; type?: string; placeholder?: string }[] = [
  { key: "client_name", label: "Your name", placeholder: "Full name" },
  { key: "contact_email", label: "Email", type: "email", placeholder: "you@business.com" },
  { key: "contact_phone", label: "WhatsApp / phone", type: "tel", placeholder: "+234…" },
  { key: "business_name", label: "Business", placeholder: "Business name" },
  { key: "business_type", label: "Business type", placeholder: "e.g. hotel, agency" },
  { key: "location", label: "Location", placeholder: "City, country" },
  { key: "project_type", label: "Project type", placeholder: "e.g. business website" },
  { key: "timeline", label: "Timeline", placeholder: "e.g. within 3 weeks" },
];

const LIST_FIELDS: { key: keyof GoldieBrief; label: string }[] = [
  { key: "business_goals", label: "Goals" },
  { key: "required_pages", label: "Pages" },
  { key: "required_features", label: "Features" },
  { key: "required_integrations", label: "Integrations" },
  { key: "additional_requirements", label: "Additional requirements" },
];

function ReviewBrief({
  brief,
  onBack,
  onEdit,
  onSent,
}: {
  brief: GoldieBrief;
  onBack: () => void;
  onEdit: (patch: Partial<GoldieBrief>) => void;
  onSent: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState(false);

  const emailOk = !brief.contact_email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.contact_email);
  const hasContact = Boolean(brief.contact_email?.trim() || brief.contact_phone?.trim());
  const canSend = hasContact && emailOk && !sending;

  async function send() {
    setTouched(true);
    if (!canSend) {
      toast.error(!hasContact ? "Add an email or WhatsApp number so Mohammed can reply." : "That email looks off.");
      return;
    }
    setSending(true);
    try {
      await submitBrief(brief);
      onSent();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send your brief. Please try WhatsApp.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 goldie-fade">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to chat
      </button>

      <div>
        <div className="text-[11px] tracking-[0.2em] text-gold font-semibold">REVIEW YOUR PROJECT BRIEF</div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Check everything below and edit anything that isn't right. Nothing is sent to PixelSpark until you confirm.
        </p>
      </div>

      <div className="space-y-2.5">
        {REVIEW_FIELDS.map(({ key, label, type, placeholder }) => {
          const invalid = touched && key === "contact_email" && !emailOk;
          return (
            <label key={key} className="block">
              <span className="text-[11px] text-muted-foreground">{label}</span>
              <input
                type={type ?? "text"}
                placeholder={placeholder}
                value={(brief[key] as string) ?? ""}
                onChange={(e) => onEdit({ [key]: e.target.value } as Partial<GoldieBrief>)}
                className={`mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 ${
                  invalid ? "border-destructive" : "border-border focus:border-gold"
                }`}
              />
              {invalid && <span className="text-[10px] text-destructive">Enter a valid email address.</span>}
            </label>
          );
        })}
      </div>

      {LIST_FIELDS.map(({ key, label }) => {
        const values = brief[key] as string[] | undefined;
        if (!values?.length) return null;
        return (
          <div key={key}>
            <div className="text-[11px] text-muted-foreground">{label}</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {values.map((v) => (
                <span key={v} className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs">
                  {v}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4 space-y-1">
        <div className="text-[11px] tracking-[0.15em] text-gold font-semibold">RECOMMENDATION</div>
        <div className="text-sm">
          <strong>{brief.recommended_plan ?? "—"}</strong>
        </div>
        <div className="text-sm">Estimated project range: {brief.estimated_range ?? "—"}</div>
        <div className="text-sm">Estimated timeline: {brief.estimated_timeline ?? brief.timeline ?? "—"}</div>
        <p className="text-[11px] text-muted-foreground pt-1 leading-relaxed">
          Estimated project range — final quote subject to scope confirmation. This is a project discovery summary, not
          an invoice.
        </p>
      </div>

      <div className="grid gap-2 pb-2">
        <button
          onClick={() => {
            if (!downloadProposal(brief)) toast.error("Allow pop-ups to download your project summary.");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
        >
          <Download className="h-4 w-4" /> Download project summary
        </button>
        <button
          onClick={send}
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold text-ink px-4 py-2.5 text-sm font-semibold shadow-gold transition-transform disabled:opacity-60 enabled:hover:-translate-y-0.5 enabled:active:scale-[0.98]"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {sending ? "Sending…" : "Send project brief to PixelSpark"}
        </button>
      </div>
    </div>
  );
}

function SentView({ brief, onBack }: { brief: GoldieBrief; onBack: () => void }) {
  const [message, setMessage] = useState(() => goldieWhatsAppMessage(brief));
  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 space-y-4 goldie-fade">
      <div className="text-center space-y-2">
        <span className="mx-auto h-12 w-12 rounded-full bg-gradient-gold text-ink grid place-items-center shadow-gold goldie-pop">
          <Check className="h-5 w-5" strokeWidth={2.4} />
        </span>
        <h3 className="font-bold text-lg">Brief sent to PixelSpark</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Mohammed will review your project and get back to you. Want to reach him directly right now?
        </p>
      </div>

      <div>
        <div className="text-[11px] text-muted-foreground mb-1">Your WhatsApp message (edit before sending)</div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-gold"
        />
      </div>

      <div className="grid gap-2 pb-2">
        <a
          href={goldieWhatsAppLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold text-ink px-4 py-2.5 text-sm font-semibold shadow-gold transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <a
          href={goldieEmailLink(brief)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
        >
          <Mail className="h-4 w-4" /> Email
        </a>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
        >
          <Linkedin className="h-4 w-4" /> LinkedIn
        </a>
        <button onClick={onBack} className="text-xs text-muted-foreground transition-colors hover:text-gold pt-1">
          Back to chat with Goldie
        </button>
      </div>
    </div>
  );
}
