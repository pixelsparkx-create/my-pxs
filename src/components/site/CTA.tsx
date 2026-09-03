import { MessageCircle, Mail } from "lucide-react";
import { whatsappLink, emailLink } from "@/lib/contact";

export function CTA() {
  return (
    <section id="contact" className="px-6 lg:px-10 py-12">
      <div className="mx-auto max-w-7xl bg-ink text-ink-foreground rounded-3xl p-8 lg:p-12 shadow-card relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_50%,oklch(0.78_0.14_78/0.4),transparent_40%),radial-gradient(circle_at_80%_60%,oklch(0.78_0.14_78/0.3),transparent_40%)]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">Have a Project in Mind?</h2>
            <p className="mt-3 text-gold text-lg font-medium">Let's Build Something Amazing Together.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
            <a
              href={whatsappLink("General Inquiry")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-gold text-ink px-7 py-3.5 rounded-full font-semibold shadow-gold hover:scale-[1.03] transition-transform"
            >
              Chat on WhatsApp <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href={emailLink("General Inquiry")}
              className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/15 text-ink-foreground px-7 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Send an Email <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
