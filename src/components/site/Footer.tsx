import { Sparkles, Linkedin, MessageCircle, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { whatsappLink, emailLink, LINKEDIN_URL, EMAIL_ADDRESS } from "@/lib/contact";

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <Sparkles className="h-5 w-5 text-gold" />
            PIXELSPARK
          </div>
          <p className="mt-4 text-sm text-ink-foreground/60 leading-relaxed">
            Building modern websites, apps and digital experiences that help businesses grow online.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-4">Quick Links</div>
          <ul className="space-y-2 text-sm text-ink-foreground/60">
            <li><Link to="/" className="hover:text-gold">Home</Link></li>
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
            <li><Link to="/services" className="hover:text-gold">Services</Link></li>
            <li><Link to="/portfolio" className="hover:text-gold">Portfolio</Link></li>
            <li><Link to="/pricing" className="hover:text-gold">Pricing</Link></li>
            <li><Link to="/pricing-guide" className="hover:text-gold">Pricing Guide</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-4">Services</div>
          <ul className="space-y-2 text-sm text-ink-foreground/60">
            <li>Websites</li>
            <li>Mobile Apps</li>
            <li>Hotel Booking Platforms</li>
            <li>UI / UX Design</li>
            <li>Game Development</li>
            <li>Brand Digital Presence</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-4">Stay Connected</div>
          <div className="space-y-3 text-sm">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-ink-foreground/70 hover:text-gold transition-colors"
            >
              <span className="h-10 w-10 rounded-full border border-white/15 group-hover:border-gold group-hover:bg-gold/10 flex items-center justify-center transition-all group-hover:shadow-gold">
                <Linkedin className="h-4 w-4" />
              </span>
              Connect on LinkedIn
            </a>
            <a
              href={whatsappLink("General Inquiry")}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-ink-foreground/70 hover:text-gold transition-colors"
            >
              <span className="h-10 w-10 rounded-full border border-white/15 group-hover:border-gold group-hover:bg-gold/10 flex items-center justify-center transition-all">
                <MessageCircle className="h-4 w-4" />
              </span>
              WhatsApp
            </a>
            <a
              href={emailLink("General Inquiry")}
              className="group flex items-center gap-3 text-ink-foreground/70 hover:text-gold transition-colors"
            >
              <span className="h-10 w-10 rounded-full border border-white/15 group-hover:border-gold group-hover:bg-gold/10 flex items-center justify-center transition-all">
                <Mail className="h-4 w-4" />
              </span>
              {EMAIL_ADDRESS}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5 text-xs text-ink-foreground/50">
          © 2026 PixelSpark. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
