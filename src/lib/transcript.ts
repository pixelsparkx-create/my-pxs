import type { GoldieBrief } from "@/lib/goldie/brief";
import { WHATSAPP_NUMBER, EMAIL_ADDRESS } from "@/lib/contact";

export type TranscriptMessage = { role: "user" | "assistant"; text: string; at?: string | null };

function esc(value: string) {
  return value.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);
}

function inline(value: string) {
  return esc(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
}

export function transcriptFileName(brief: GoldieBrief, type: "client" | "internal") {
  const who = (brief.client_name || brief.business_name || "Consultation")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const date = new Date().toISOString().slice(0, 10);
  return type === "internal"
    ? `PixelSpark-Internal-Record-${who}-${date}.pdf`
    : `PixelSpark-Goldie-Consultation-${who}-${date}.pdf`;
}

function summaryRows(brief: GoldieBrief) {
  const rows: [string, string][] = [];
  const push = (label: string, value?: string | string[] | null) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return;
    rows.push([label, Array.isArray(value) ? value.join(", ") : String(value)]);
  };
  push("Client", brief.client_name);
  push("Business", brief.business_name);
  push("Industry", brief.business_type);
  push("Location", brief.location);
  push("Website objective", brief.project_type);
  push("Business goals", brief.business_goals);
  push("Target audience", brief.target_audience);
  push("Required pages", brief.required_pages);
  push("Required features", brief.required_features);
  push("Integrations", brief.required_integrations);
  push("Design preferences", brief.design_direction);
  push("Recommended package", brief.recommended_plan);
  push("Estimated range", brief.estimated_range);
  push("Timeline", brief.timeline ?? brief.estimated_timeline);
  push("Important requirements", brief.additional_requirements);
  return rows;
}

export function buildTranscriptHtml(options: {
  brief: GoldieBrief;
  messages: TranscriptMessage[];
  type: "client" | "internal";
  sessionId?: string | null;
  leadId?: string | null;
  adminNotes?: string | null;
  print?: boolean;
}) {
  const { brief, messages, type } = options;
  const rows = summaryRows(brief);
  const outstanding: string[] = [];
  if (!brief.contact_email && !brief.contact_phone) outstanding.push("Contact details not yet provided.");
  if (!brief.timeline && !brief.estimated_timeline) outstanding.push("Preferred timeline not confirmed.");
  if (!brief.budget) outstanding.push("Budget expectation not confirmed.");

  const internalBlock =
    type === "internal"
      ? `<h2>Internal Record</h2><table class="kv">
${options.sessionId ? `<tr><td>Goldie session</td><td>${esc(options.sessionId)}</td></tr>` : ""}
${options.leadId ? `<tr><td>Lead ID</td><td>${esc(options.leadId)}</td></tr>` : ""}
${brief.contact_email ? `<tr><td>Email</td><td>${esc(brief.contact_email)}</td></tr>` : ""}
${brief.contact_phone ? `<tr><td>Phone</td><td>${esc(brief.contact_phone)}</td></tr>` : ""}
${brief.complexity ? `<tr><td>Complexity</td><td>${esc(brief.complexity)}</td></tr>` : ""}
${brief.budget ? `<tr><td>Budget signal</td><td>${esc(brief.budget)}</td></tr>` : ""}
${options.adminNotes ? `<tr><td>Admin notes</td><td>${esc(options.adminNotes)}</td></tr>` : ""}
</table>`
      : "";

  return `<!doctype html><html><head><meta charset="utf-8" />
<title>${type === "internal" ? "PixelSpark Internal Record" : "Goldie AI Consultation"}${brief.business_name ? ` — ${esc(brief.business_name)}` : ""}</title>
<style>
  @page { margin: 16mm; }
  body { font-family: -apple-system, "Segoe UI", Inter, Helvetica, sans-serif; color:#111; line-height:1.6; margin:0; padding:24px; background:#fff; }
  .wrap { max-width:760px; margin:0 auto; }
  header { border-bottom:3px solid #C9A227; padding-bottom:16px; margin-bottom:20px; }
  .kicker { font-size:11px; letter-spacing:3px; color:#8a8a8a; text-transform:uppercase; }
  .brand { font-size:26px; font-weight:800; letter-spacing:-0.5px; }
  .brand span { color:#C9A227; }
  h1 { font-size:19px; margin:8px 0 0; }
  h2 { font-size:13px; letter-spacing:1.6px; text-transform:uppercase; color:#C9A227; margin:24px 0 8px; }
  table.kv { width:100%; border-collapse:collapse; font-size:13px; }
  table.kv td { padding:6px 0; border-bottom:1px solid #eee; vertical-align:top; }
  table.kv td:first-child { width:200px; color:#777; text-transform:uppercase; font-size:10.5px; letter-spacing:1.2px; padding-top:9px; }
  .msg { margin:10px 0; font-size:13.5px; }
  .who { font-size:10.5px; letter-spacing:1.4px; text-transform:uppercase; color:#8a8a8a; margin-bottom:3px; }
  .client .bubble { background:#f5f5f5; border-left:3px solid #111; }
  .goldie .bubble { background:#faf7ee; border-left:3px solid #C9A227; }
  .bubble { padding:10px 14px; border-radius:0 12px 12px 0; }
  .muted { font-size:12.5px; color:#555; }
  footer { margin-top:24px; border-top:1px solid #ddd; padding-top:12px; font-size:10.5px; color:#666; }
</style></head><body><div class="wrap">
<header>
  <div class="kicker">${type === "internal" ? "Internal Record" : "Goldie AI Consultation"}</div>
  <div class="brand">PIXEL<span>SPARK</span></div>
  <h1>${esc(brief.business_name || brief.client_name || "Project consultation")}</h1>
  <div class="muted">${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
</header>

<h2>Consultation Summary</h2>
${rows.length ? `<table class="kv">${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table>` : `<p class="muted">No structured project details were captured in this conversation.</p>`}

${outstanding.length ? `<h2>Outstanding Questions</h2><ul>${outstanding.map((o) => `<li class="muted">${esc(o)}</li>`).join("")}</ul>` : ""}

${internalBlock}

<h2>Conversation</h2>
${
  messages.length
    ? messages
        .map(
          (m) =>
            `<div class="msg ${m.role === "user" ? "client" : "goldie"}"><div class="who">${m.role === "user" ? "Client" : "Goldie"}</div><div class="bubble">${inline(m.text)}</div></div>`,
        )
        .join("")
    : `<p class="muted">No conversation messages recorded.</p>`
}

<footer>
  ${type === "internal" ? "Confidential internal record — not for client distribution." : "Discovery summary — estimated ranges are not an official quote."}<br/>
  PixelSpark · WhatsApp +${WHATSAPP_NUMBER} · ${EMAIL_ADDRESS}
</footer>
</div>
${options.print ? `<script>window.onload = () => window.print();<\/script>` : ""}
</body></html>`;
}

/** Opens a print-ready transcript window (Save as PDF). False when pop-ups are blocked. */
export function downloadTranscript(options: Parameters<typeof buildTranscriptHtml>[0]) {
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
  if (!win) return false;
  win.document.write(buildTranscriptHtml({ ...options, print: true }));
  win.document.title = transcriptFileName(options.brief, options.type).replace(/\.pdf$/, "");
  win.document.close();
  return true;
}
