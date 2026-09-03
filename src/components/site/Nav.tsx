import { useState } from "react";
import { Menu, X, Sparkles, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { whatsappLink } from "@/lib/contact";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/pricing", label: "Pricing" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
          <Sparkles className="h-6 w-6 text-gold" strokeWidth={1.5} />
          <span>PIXELSPARK</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-gold" }}
              className="text-sm font-medium text-foreground/70 hover:text-gold transition-colors relative after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-gold hover:after:w-full after:transition-all"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <a
          href={whatsappLink("General Inquiry")}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:inline-flex items-center gap-2 bg-gradient-gold text-ink px-5 py-2.5 rounded-full font-semibold text-sm shadow-gold hover:scale-[1.03] transition-transform"
        >
          Let's Talk <MessageCircle className="h-4 w-4" />
        </a>
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <nav className="px-6 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-gold" }}
                onClick={() => setOpen(false)}
                className="py-2.5 text-foreground/80 hover:text-gold border-b border-border/40"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={whatsappLink("General Inquiry")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink px-5 py-3 rounded-full font-semibold shadow-gold"
            >
              Let's Talk <MessageCircle className="h-4 w-4" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
