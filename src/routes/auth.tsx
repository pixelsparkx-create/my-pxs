import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/auth-google";

function sanitizeNext(value: unknown): string {
  if (typeof value !== "string") return "/";
  // same-origin relative paths only
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ next: sanitizeNext(s.next) }),
  head: () => ({
    meta: [
      { title: "Sign in — PixelSpark Studio" },
      {
        name: "description",
        content:
          "Sign in to your PixelSpark Studio account to connect AI assistants and manage your testimonials.",
      },
      { property: "og:title", content: "Sign in — PixelSpark Studio" },
      {
        property: "og:description",
        content: "Sign in to your PixelSpark Studio account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const returnUrl = `${typeof window !== "undefined" ? window.location.origin : ""}${next}`;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = next;
    });
  }, [next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: returnUrl },
      });
      setBusy(false);
      if (error) return setError(error.message);
      setNotice("Check your email to confirm your account, then sign in.");
      setMode("signin");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    window.location.href = next;
  }

  async function onGoogle() {
    setError(null);
    const result = await signInWithGoogle(returnUrl);
    if (result.error)
      return setError(String((result.error as { message?: string }).message ?? result.error));
    if (result.redirected) return;
    navigate({ to: next as string });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-background">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-card p-8">
        <div className="text-xs font-semibold tracking-[0.2em] text-gold">PIXELSPARK STUDIO</div>
        <h1 className="mt-2 text-2xl font-bold">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to connect AI assistants and manage your feedback.
        </p>

        <button
          type="button"
          onClick={onGoogle}
          className="mt-6 w-full rounded-full border border-border px-5 py-3 font-semibold hover:bg-muted transition-colors"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && <p className="text-sm text-gold">{notice}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-gradient-gold text-ink px-5 py-3 font-semibold shadow-gold disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "signin"
            ? "No account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
