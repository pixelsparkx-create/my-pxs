import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Sparkles,
  Crown,
  ArrowRight,
  ShieldCheck,
  Layers,
  Cpu,
  CreditCard,
  Users,
  LayoutDashboard,
  Bot,
  Plug,
  Workflow,
  Wand2,
  Database,
  MessageCircle,
  Globe,
  Server,
  ChevronDown,
} from "lucide-react";
import { ContactModal } from "./ContactModal";
import { whatsappLink } from "@/lib/contact";

const plans = [
  {
    name: "Starter",
    sub: "1-Page Landing Site",
    price: "₦25,000",
    badge: null as string | null,
    badgeIcon: null as any,
    highlight: false,
    best:
      "Small businesses, personal brands, freelancers, new businesses and anyone who needs a professional online presence without a large website.",
    note:
      "Designed for businesses that mainly need a strong online introduction and a clear contact / conversion point.",
    features: [
      "1-page landing website",
      "Mobile responsive design",
      "Desktop, tablet and mobile optimization",
      "Professional custom layout",
      "Hero section",
      "About / business section",
      "Services section",
      "Contact section",
      "Contact form",
      "WhatsApp integration",
      "Social media links",
      "Basic SEO",
      "Basic performance optimization",
      "Basic animations and interactions",
      "Website deployment",
    ],
    cta: "Choose Starter",
  },
  {
    name: "Growth",
    sub: "Business Website",
    price: "₦60,000",
    badge: "Most Popular",
    badgeIcon: Sparkles,
    highlight: true,
    best:
      "Established businesses, hotels, restaurants, agencies, service businesses, startups and companies that need a complete professional website.",
    note:
      "The recommended plan for most businesses that need a complete website rather than a simple landing page.",
    features: [
      "Up to 5 pages",
      "Custom design",
      "Mobile responsive design",
      "Professional UI/UX",
      "Business / service pages",
      "Contact forms",
      "WhatsApp integration",
      "Booking / request forms",
      "On-page SEO",
      "Google Maps integration",
      "Social media integration",
      "Performance optimization",
      "Modern animations and interactions",
      "Website deployment",
      "1 month support",
    ],
    cta: "Choose Growth",
  },
  {
    name: "Premium",
    sub: "Complete Digital Solution",
    price: "₦100,000",
    badge: "Best Value",
    badgeIcon: Crown,
    highlight: false,
    best:
      "Businesses that need advanced functionality, custom workflows, dashboards, integrations or web-app-style features.",
    note:
      "“Unlimited pages” refers to standard informational pages. Complex applications, advanced integrations, extensive databases or highly specialized functionality may require a custom quote.",
    features: [
      "Unlimited standard informational pages",
      "Completely custom UI/UX",
      "Advanced functionality",
      "Web app / dashboard functionality",
      "Advanced forms",
      "Booking systems",
      "Database functionality",
      "Payment integrations",
      "AI chatbot integrations",
      "API / third-party integrations",
      "Custom business workflows",
      "Advanced animations and interactions",
      "Advanced SEO",
      "Performance optimization",
      "Priority delivery",
      "3 months support",
    ],
    cta: "Choose Premium",
  },
];

const increases = [
  { icon: Layers, title: "Additional Pages", body: "If a Growth project requires more than the included 5 pages." },
  {
    icon: Workflow,
    title: "Advanced Booking",
    body: "Real-time availability, reservations, automated confirmations, booking management, cancellation systems and similar.",
  },
  {
    icon: CreditCard,
    title: "Payment Integration",
    body: "Flutterwave, Paystack, Stripe or other payment systems when not included in the original scope.",
  },
  {
    icon: Users,
    title: "Customer Accounts",
    body: "Login, registration, profiles, booking history and account dashboards.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin Dashboards",
    body: "Custom systems for managing bookings, customers, products, orders, content or other business data.",
  },
  { icon: Bot, title: "AI Features", body: "AI chatbots, AI assistants, recommendations or other AI-powered functionality." },
  {
    icon: Plug,
    title: "Third-Party Integrations",
    body: "CRMs, external APIs, email platforms, maps, booking platforms, analytics and other external services.",
  },
  {
    icon: Cpu,
    title: "Advanced Automation",
    body: "Automated emails, notifications, workflows, reports and other business automation.",
  },
  {
    icon: Wand2,
    title: "Complex UI / Animation",
    body: "Advanced interactive experiences, 3D elements, highly customized animations or other specialized interfaces.",
  },
  {
    icon: Database,
    title: "Custom Database Systems",
    body: "Systems that store and manage customers, bookings, products, orders, appointments, inventory or other structured data.",
  },
];

const steps = [
  ["01", "Choose a Package"],
  ["02", "Tell PixelSpark What You Need"],
  ["03", "We Review Your Requirements"],
  ["04", "We Identify Any Custom Requirements"],
  ["05", "You Receive a Clear Final Quote"],
  ["06", "You Approve the Scope"],
  ["07", "Development Begins"],
];

const notIncluded = [
  "Domain registration",
  "Hosting fees where applicable",
  "Third-party software subscriptions",
  "Premium API usage",
  "AI API usage",
  "Payment gateway transaction fees",
  "Paid plugins / services",
  "Other third-party provider charges",
];

const faqs: [string, string][] = [
  ["Can I upgrade my plan later?", "Yes. You can move to a higher package at any point. We'll confirm the difference in scope and price before continuing."],
  ["Can I add more pages?", "Yes. Additional pages beyond your package's included pages are quoted before development begins."],
  ["What happens if I need a feature that isn't listed?", "Tell us what you need. We review it, explain what's involved and send you an updated quote for approval."],
  ["Does PixelSpark provide hosting?", "We handle deployment. Hosting fees, where applicable, are billed by the hosting provider and are separate from development."],
  ["Is a domain included?", "No. Domain registration and renewal are paid to the domain provider. We'll guide you through it."],
  ["Are payment gateway fees included?", "No. Transaction fees are charged by the payment provider (Flutterwave, Paystack, Stripe and similar)."],
  ["Can you build a completely custom website?", "Yes. Fully custom projects are handled under Premium or a custom quote depending on the functionality required."],
  ["Can I request a dashboard?", "Yes. Admin or customer dashboards are custom functionality — we scope and quote them before development."],
  ["Can I add AI features?", "Yes. AI chatbots and assistants can be added. Ongoing AI API usage is billed by the provider."],
  ["Can I pay a deposit?", "Yes. Payment structure is agreed with you before development starts."],
  ["Will I know the final price before development begins?", "Always. Development only starts after you approve the final scope and quote."],
  ["Can I request changes after development starts?", "Yes. Small refinements are normal. Changes that add new functionality are quoted first, then approved by you."],
];

function Section({
  eyebrow,
  title,
  children,
  id,
}: {
  eyebrow?: string;
  title?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-6 lg:px-10 py-14 lg:py-20">
      {eyebrow && <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">{eyebrow}</div>}
      {title && <h2 className="text-2xl lg:text-4xl font-bold mb-8 lg:mb-10">{title}</h2>}
      {children}
    </section>
  );
}

export function PricingGuide() {
  const [selected, setSelected] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-gradient-gold opacity-20 blur-3xl" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-12 lg:pt-24 lg:pb-16 text-center relative">
          <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-4">PRICING GUIDE</div>
          <h1 className="text-4xl lg:text-6xl font-bold leading-[1.05]">
            Know Exactly What <span className="bg-gradient-gold bg-clip-text text-transparent">You're Paying For.</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-muted-foreground">
            Every PixelSpark package has a clearly defined scope. Explore what's included, what you can add, and how
            custom requirements can affect your final project price — before development begins.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#plans"
              className="inline-flex items-center gap-2 bg-gradient-gold text-ink px-6 py-3 rounded-full font-semibold shadow-gold hover:scale-[1.03] transition-transform"
            >
              View Plans <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={whatsappLink("Pricing Guide — Custom Requirements")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-semibold hover:border-gold hover:text-gold transition-colors"
            >
              Tell Us What You Need <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <Section id="plans" eyebrow="PLAN BREAKDOWN" title="What Each Package Actually Includes">
        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((p) => {
            const BadgeIcon = p.badgeIcon;
            return (
              <div
                key={p.name}
                className={`group relative rounded-3xl p-7 transition-all duration-500 hover:-translate-y-2 ${
                  p.highlight
                    ? "bg-card border-2 border-gold shadow-gold"
                    : "bg-card border border-border hover:border-gold/60 hover:shadow-gold"
                }`}
              >
                <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-gold opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-ink text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-gold">
                    {BadgeIcon && <BadgeIcon className="h-3 w-3" />} {p.badge}
                  </div>
                )}
                <div className="relative">
                  <div className="font-bold text-xl">{p.name}</div>
                  <div className="text-xs text-muted-foreground mb-4">{p.sub}</div>
                  <div className="text-4xl font-bold mb-4 bg-gradient-gold bg-clip-text text-transparent">{p.price}</div>

                  <div className="text-xs font-semibold tracking-[0.15em] text-gold mb-2">BEST FOR</div>
                  <p className="text-sm text-muted-foreground mb-5">{p.best}</p>

                  <div className="text-xs font-semibold tracking-[0.15em] text-gold mb-2">INCLUDED</div>
                  <ul className="space-y-2 mb-5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" /> <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs text-muted-foreground border-l-2 border-gold/50 pl-3 mb-6">{p.note}</p>

                  <button
                    onClick={() => setSelected(p.name)}
                    className={`block w-full text-center py-3 rounded-full text-sm font-semibold transition-all ${
                      p.highlight
                        ? "bg-gradient-gold text-ink hover:scale-[1.02] shadow-gold"
                        : "border border-border hover:border-gold hover:text-gold hover:bg-gold/5"
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* CUSTOM MEANING */}
      <Section eyebrow="WHAT DOES “CUSTOM” MEAN?" title="Your Project Is Designed Around Your Business">
        <p className="max-w-3xl text-muted-foreground mb-8">
          PixelSpark does not reuse the same template for every client. Custom design means your website is designed
          around your brand, business goals, audience and required functionality.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-border bg-card p-7 hover:border-gold/60 hover:shadow-gold transition-all">
            <Globe className="h-7 w-7 text-gold mb-4" strokeWidth={1.5} />
            <div className="font-bold text-lg mb-1">Basic Website</div>
            <p className="text-sm text-muted-foreground mb-4">Presents your business and turns visitors into contacts.</p>
            <ul className="space-y-2 text-sm">
              {["Information", "Services", "Contact", "Conversion"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border-2 border-gold bg-card p-7 shadow-gold">
            <Server className="h-7 w-7 text-gold mb-4" strokeWidth={1.5} />
            <div className="font-bold text-lg mb-1">Advanced Website / Web App</div>
            <p className="text-sm text-muted-foreground mb-4">Runs part of your business, not just presents it.</p>
            <ul className="space-y-2 text-sm">
              {["Accounts", "Dashboards", "Bookings", "Databases", "Payments", "Integrations", "Automation"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" /> {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* PRICE INCREASE */}
      <Section eyebrow="SCOPE & COST" title="Why Would My Final Price Be Higher?">
        <p className="max-w-3xl text-muted-foreground mb-3">
          The prices shown on our plans cover the features and scope listed for each package. Your final project price
          may increase if you request functionality outside the selected package.
        </p>
        <p className="max-w-3xl text-sm font-medium mb-10">
          PixelSpark does not secretly increase prices. Additional costs only apply when you request additional scope or
          functionality — and only after you approve it.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {increases.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 hover:border-gold/60 hover:shadow-gold transition-all duration-500"
            >
              <Icon className="h-6 w-6 text-gold mb-3" strokeWidth={1.5} />
              <div className="font-semibold mb-1">{title}</div>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* EXAMPLE */}
      <Section eyebrow="REAL-WORLD EXAMPLE" title="How A Final Quote Comes Together">
        <div className="rounded-3xl bg-gradient-ink text-ink-foreground p-8 lg:p-12 shadow-card">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase bg-gold/20 text-gold px-3 py-1 rounded-full mb-6">
            <Sparkles className="h-3 w-3" /> Example only
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div>
              <div className="text-xs tracking-[0.2em] text-gold mb-2">GROWTH WEBSITE</div>
              <div className="text-3xl font-bold mb-4">₦60,000</div>
              <ul className="space-y-2 text-sm text-ink-foreground/80">
                {["5-page business website", "Custom design", "Forms", "Booking functionality", "SEO", "1 month support"].map(
                  (x) => (
                    <li key={x} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-gold" /> {x}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div>
              <div className="text-xs tracking-[0.2em] text-gold mb-2">CLIENT ADDITIONALLY REQUESTS</div>
              <ul className="space-y-2 text-sm text-ink-foreground/80 mt-2">
                {["Online payment integration", "Customer booking dashboard", "AI chatbot"].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <span className="text-gold">+</span> {x}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-ink-foreground/70">
                PixelSpark reviews the additional requirements and provides an updated quote.
              </p>
            </div>
            <div className="rounded-2xl border border-gold/40 p-6 bg-white/5">
              <div className="text-xs tracking-[0.2em] text-gold mb-3">EXAMPLE FINAL QUOTE</div>
              <div className="text-sm text-ink-foreground/70">₦60,000</div>
              <div className="text-sm text-ink-foreground/70">+ additional custom functionality</div>
              <div className="mt-3 text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">₦75,000</div>
              <p className="mt-4 text-xs text-ink-foreground/70">
                Illustrative figures only — add-on features are not fixed-price. The client receives the updated quote and
                approves it before additional development begins.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* NO SURPRISE PRICING */}
      <Section eyebrow="TRANSPARENCY" title="No Surprise Pricing.">
        <p className="max-w-3xl text-muted-foreground mb-8">
          The price of your selected package covers the scope listed on this page. If your project requires additional
          functionality, we'll explain what is needed, why it affects the price and what the additional cost will be
          before we proceed.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            "Clear scope",
            "Clear pricing",
            "No hidden development charges",
            "Client approval before additional work",
            "Final price agreed before development",
          ].map((t) => (
            <div
              key={t}
              className="rounded-2xl border border-border bg-card p-5 text-sm font-medium hover:border-gold/60 hover:shadow-gold transition-all"
            >
              <ShieldCheck className="h-5 w-5 text-gold mb-3" strokeWidth={1.5} />
              {t}
            </div>
          ))}
        </div>
      </Section>

      {/* PROCESS */}
      <Section eyebrow="PROCESS" title="How Your Final Price Is Decided">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map(([n, label]) => (
            <div
              key={n}
              className="group relative rounded-2xl border border-border bg-card p-6 overflow-hidden hover:-translate-y-1 hover:border-gold/60 hover:shadow-gold transition-all duration-500"
            >
              <div className="absolute -right-2 -top-4 text-6xl font-bold text-gold/10 group-hover:text-gold/20 transition-colors">
                {n}
              </div>
              <div className="text-xs font-semibold tracking-[0.2em] text-gold mb-3">{n}</div>
              <div className="font-semibold relative">{label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* NOT INCLUDED */}
      <Section eyebrow="EXTERNAL COSTS" title="What Is Not Included Automatically">
        <p className="max-w-3xl text-muted-foreground mb-8">
          Some costs are paid to external providers and are separate from development. We always communicate these
          requirements before they become necessary.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {notIncluded.map((t) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-5 text-sm hover:border-gold/60 transition-colors">
              {t}
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title="Questions, Answered">
        <div className="max-w-3xl divide-y divide-border rounded-3xl border border-border bg-card">
          {faqs.map(([q, a], i) => {
            const open = openFaq === i;
            return (
              <div key={q}>
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 hover:text-gold transition-colors"
                  aria-expanded={open}
                >
                  <span className="font-medium">{q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-gold transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-500 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm text-muted-foreground">{a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-20">
        <div className="rounded-3xl bg-gradient-ink text-ink-foreground p-10 lg:p-16 text-center shadow-card">
          <h2 className="text-3xl lg:text-4xl font-bold">Not Sure Which Plan You Need?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-ink-foreground/75">
            Tell us what you're trying to build. We'll help you understand which PixelSpark package fits your project and
            what functionality you'll need.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink("Pricing Guide — Plan Advice")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-gold text-ink px-6 py-3 rounded-full font-semibold shadow-gold hover:scale-[1.03] transition-transform"
            >
              Talk to PixelSpark <MessageCircle className="h-4 w-4" />
            </a>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 border border-ink-foreground/30 px-6 py-3 rounded-full font-semibold hover:border-gold hover:text-gold transition-colors"
            >
              Choose a Plan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <ContactModal open={!!selected} plan={selected ?? ""} onClose={() => setSelected(null)} />
    </div>
  );
}
