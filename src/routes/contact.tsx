import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Mail, Linkedin } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { whatsappLink, emailLink, LINKEDIN_URL, EMAIL_ADDRESS, WHATSAPP_NUMBER } from "@/lib/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PixelSpark" },
      { name: "description", content: "Get in touch with Mohammed at PixelSpark via WhatsApp, email or LinkedIn." },
      { property: "og:title", content: "Contact — PixelSpark" },
      { property: "og:description", content: "Let's build something premium. WhatsApp, email or LinkedIn — message lands pre-filled." },
    ],
  }),
  component: ContactPage,
});

const channels = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: `+${WHATSAPP_NUMBER}`,
    href: whatsappLink("General Inquiry"),
    cta: "Open chat",
  },
  {
    icon: Mail,
    label: "Email",
    value: EMAIL_ADDRESS,
    href: emailLink("General Inquiry"),
    cta: "Compose email",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "Connect on LinkedIn",
    href: LINKEDIN_URL,
    cta: "Open LinkedIn",
  },
];

function ContactPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-6 lg:px-10 py-16 lg:py-24">
        <div className="text-center">
          <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">CONTACT</div>
          <h1 className="text-4xl lg:text-6xl font-bold">Let's Build Something Premium</h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Pick your favourite channel — your message lands pre-filled and ready to send.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-5">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl bg-card border border-border p-7 hover:border-gold/60 hover:-translate-y-1 transition-all duration-500 shadow-card hover:shadow-gold text-center"
            >
              <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-gold flex items-center justify-center mb-4 shadow-gold">
                <c.icon className="h-6 w-6 text-ink" strokeWidth={1.8} />
              </div>
              <div className="text-xs font-semibold tracking-wider uppercase text-gold mb-1">{c.label}</div>
              <div className="font-semibold text-sm break-words">{c.value}</div>
              <div className="mt-4 text-xs font-semibold text-foreground group-hover:text-gold transition-colors">
                {c.cta} →
              </div>
            </a>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
