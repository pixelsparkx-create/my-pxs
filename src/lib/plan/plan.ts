import { PACKAGES, formatRange, type ComplexityFactor, type PlanName } from "./estimator";
import { WHATSAPP_NUMBER, EMAIL_ADDRESS, LINKEDIN_URL } from "@/lib/contact";

export type PlanRecord = {
  reference: string;
  client_name?: string | null;
  business_name?: string | null;
  industry?: string | null;
  project_goal?: string | null;
  target_audience?: string | null;
  recommended_plan: string;
  base_price: number;
  estimate_min: number;
  estimate_max: number;
  currency?: string | null;
  complexity_factors?: ComplexityFactor[] | null;
  required_pages?: string[] | null;
  required_features?: string[] | null;
  required_integrations?: string[] | null;
  design_direction?: string | null;
  timeline?: string | null;
  rationale?: string | null;
  created_at?: string | null;
};

function esc(value: string) {
  return value.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);
}

function naira(value: number) {
  return `₦${Number(value ?? 0).toLocaleString("en-NG")}`;
}

export function planFileName(plan: PlanRecord) {
  const who = (plan.business_name || plan.client_name || "Website")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const date = new Date(plan.created_at ?? Date.now()).toISOString().slice(0, 10);
  return `PixelSpark-Website-Plan-${who}-${date}.pdf`;
}

export function planShareUrl(reference: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/plan/${reference}`;
}

export function planWhatsAppMessage(plan: PlanRecord) {
  return `Hi PixelSpark, I just completed the website pricing guide and generated my project plan.

Plan reference: ${plan.reference}
Recommended package: ${plan.recommended_plan}
Estimated investment: ${formatRange(plan.estimate_min, plan.estimate_max)}
${plan.business_name ? `Business: ${plan.business_name}\n` : ""}Plan: ${planShareUrl(plan.reference)}

I'd like to discuss my project.`;
}

export function planWhatsAppLink(plan: PlanRecord) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(planWhatsAppMessage(plan))}`;
}

export function planEmailLink(plan: PlanRecord) {
  const subject = encodeURIComponent("My PixelSpark Website Project Plan");
  return `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${encodeURIComponent(planWhatsAppMessage(plan))}`;
}

const COST_FACTORS = [
  "Advanced booking systems",
  "Payment integrations",
  "AI chatbots and assistants",
  "Customer accounts and dashboards",
  "Complex databases",
  "Custom web applications",
  "Third-party API integrations",
  "Advanced animations",
  "Additional pages",
  "E-commerce functionality",
  "Complex admin systems",
];

function list(title: string, items?: string[] | null) {
  if (!items || items.length === 0) return "";
  return `<h2>${esc(title)}</h2><ul>${items.map((i) => `<li>${esc(String(i))}</li>`).join("")}</ul>`;
}

export function buildPlanHtml(plan: PlanRecord, options: { print?: boolean } = {}) {
  const pkg = PACKAGES[(plan.recommended_plan as PlanName) in PACKAGES ? (plan.recommended_plan as PlanName) : "Growth"];
  const factors = plan.complexity_factors ?? [];

  return `<!doctype html><html><head><meta charset="utf-8" />
<title>PixelSpark Website Project Plan${plan.business_name ? ` — ${esc(plan.business_name)}` : ""}</title>
<style>
  @page { margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Inter, Helvetica, sans-serif; color:#111; line-height:1.6; margin:0; padding:24px; background:#fff; }
  .wrap { max-width: 760px; margin: 0 auto; }
  header { border-bottom:3px solid #C9A227; padding-bottom:16px; margin-bottom:22px; }
  .kicker { font-size:11px; letter-spacing:3px; color:#8a8a8a; text-transform:uppercase; }
  .brand { font-size:26px; font-weight:800; letter-spacing:-0.5px; }
  .brand span { color:#C9A227; }
  h1 { font-size:20px; margin:10px 0 0; }
  h2 { font-size:13px; letter-spacing:1.6px; text-transform:uppercase; color:#C9A227; margin:24px 0 8px; }
  .meta { display:grid; grid-template-columns:1fr 1fr; gap:8px 20px; background:#faf7ee; border:1px solid #eadfbe; border-radius:14px; padding:16px; font-size:13px; }
  .meta b { display:block; font-size:10px; letter-spacing:1.4px; text-transform:uppercase; color:#8a7a48; font-weight:700; }
  .price { margin:20px 0; border:1px solid #111; border-radius:16px; padding:18px 20px; }
  .price .amount { font-size:26px; font-weight:800; letter-spacing:-0.5px; }
  .price .note { font-size:11px; color:#666; margin-top:4px; }
  ul { margin:6px 0; padding-left:18px; }
  li { margin:3px 0; font-size:13.5px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  td { padding:8px 0; border-bottom:1px solid #eee; vertical-align:top; }
  td.amount { text-align:right; white-space:nowrap; font-weight:600; }
  .muted { font-size:12.5px; color:#555; }
  .cta { margin-top:24px; border-top:3px solid #C9A227; padding-top:16px; }
  .cta a { color:#111; text-decoration:none; font-weight:600; }
  footer { margin-top:22px; border-top:1px solid #ddd; padding-top:12px; font-size:10.5px; color:#666; }
</style></head><body><div class="wrap">
<header>
  <div class="kicker">Website Project Plan</div>
  <div class="brand">PIXEL<span>SPARK</span></div>
  <h1>${esc(plan.business_name || plan.client_name || "Your Website Plan")}</h1>
  <div class="muted">Reference ${esc(plan.reference)} · ${new Date(plan.created_at ?? Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
</header>

<div class="meta">
  ${plan.client_name ? `<div><b>Client</b>${esc(plan.client_name)}</div>` : ""}
  ${plan.business_name ? `<div><b>Business</b>${esc(plan.business_name)}</div>` : ""}
  ${plan.industry ? `<div><b>Industry</b>${esc(plan.industry)}</div>` : ""}
  ${plan.timeline ? `<div><b>Timeline</b>${esc(plan.timeline)}</div>` : ""}
  ${plan.target_audience ? `<div><b>Target audience</b>${esc(plan.target_audience)}</div>` : ""}
  ${plan.design_direction ? `<div><b>Design direction</b>${esc(plan.design_direction)}</div>` : ""}
</div>

${plan.project_goal ? `<h2>Project Goal</h2><p class="muted">${esc(plan.project_goal)}</p>` : ""}

<div class="price">
  <div class="kicker">Recommended package</div>
  <div class="amount">${esc(plan.recommended_plan)} — ${naira(plan.base_price)} base</div>
  <div style="margin-top:10px" class="kicker">Estimated investment</div>
  <div class="amount">${esc(formatRange(plan.estimate_min, plan.estimate_max))}</div>
  <div class="note">This is an estimate, not an official quote. Your final price is confirmed after we review your requirements together.</div>
</div>

${plan.rationale ? `<h2>Why This Plan</h2><p class="muted">${esc(plan.rationale)}</p>` : ""}

<h2>What ${esc(plan.recommended_plan)} Includes</h2>
<ul>${pkg.includes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>

${
  factors.length
    ? `<h2>Additional Requirements Identified</h2><table>${factors
        .map(
          (f) =>
            `<tr><td><strong>${esc(f.title)}</strong><br/><span class="muted">${esc(f.body)}</span></td><td class="amount">+${naira(f.cost)}</td></tr>`,
        )
        .join("")}</table>`
    : ""
}

${list("Requested Pages", plan.required_pages)}
${list("Requested Features", plan.required_features)}
${list("Integrations", plan.required_integrations)}

<h2>What Can Increase The Final Price</h2>
<p class="muted">We keep this transparent up front so nothing surprises you later. Final pricing may increase where a project requires:</p>
<ul>${COST_FACTORS.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>

<div class="cta">
  <h2 style="margin-top:0">Ready To Build?</h2>
  <p class="muted">Start your project with PixelSpark — we'll confirm your scope and send a clear final quote before development begins.</p>
  <p>
    WhatsApp: <a href="https://wa.me/${WHATSAPP_NUMBER}">+234 708 158 0318</a><br/>
    Email: <a href="mailto:${EMAIL_ADDRESS}">${EMAIL_ADDRESS}</a><br/>
    LinkedIn: <a href="${LINKEDIN_URL}">PixelSpark on LinkedIn</a>
  </p>
</div>

<footer>
  Estimated range only — not an official quote or invoice. Domain registration, hosting, third-party subscriptions, premium API usage and payment gateway fees are billed separately by their providers.<br/>
  PixelSpark · Plan reference ${esc(plan.reference)}
</footer>
</div>
${options.print ? `<script>window.onload = () => window.print();<\/script>` : ""}
</body></html>`;
}

/** Opens the branded plan in a print window (Save as PDF). Returns false when pop-ups are blocked. */
export function downloadPlanPdf(plan: PlanRecord) {
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
  if (!win) return false;
  win.document.write(buildPlanHtml(plan, { print: true }));
  win.document.title = planFileName(plan).replace(/\.pdf$/, "");
  win.document.close();
  return true;
}
