import type { GoldieBrief } from "./brief";

function escapeHtml(value: string) {
  return value.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);
}

function markdownToHtml(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => {
      const safe = escapeHtml(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      if (/^#{3}\s/.test(line)) return `<h3>${safe.replace(/^###\s/, "")}</h3>`;
      if (/^#{2}\s/.test(line)) return `<h2>${safe.replace(/^##\s/, "")}</h2>`;
      if (/^#\s/.test(line)) return `<h2>${safe.replace(/^#\s/, "")}</h2>`;
      if (/^[-*]\s/.test(line)) return `<li>${safe.replace(/^[-*]\s/, "")}</li>`;
      if (!line.trim()) return "";
      return `<p>${safe}</p>`;
    })
    .join("\n");
}

export function buildProposalHtml(brief: GoldieBrief) {
  const body = markdownToHtml(brief.proposal_markdown ?? brief.conversation_summary ?? "");

  return `<!doctype html><html><head><meta charset="utf-8" />
<title>PixelSpark Project Summary${brief.business_name ? ` — ${escapeHtml(brief.business_name)}` : ""}</title>
<style>
  @page { margin: 18mm; }
  body { font-family: -apple-system, "Segoe UI", Inter, sans-serif; color:#111; line-height:1.6; }
  header { border-bottom:3px solid #C9A227; padding-bottom:14px; margin-bottom:24px; }
  .brand { font-size:24px; font-weight:800; letter-spacing:-0.5px; }
  .brand span { color:#C9A227; }
  .kicker { font-size:11px; letter-spacing:3px; color:#8a8a8a; text-transform:uppercase; }
  h2 { font-size:15px; letter-spacing:1px; text-transform:uppercase; color:#C9A227; margin:22px 0 6px; }
  h3 { font-size:14px; margin:16px 0 4px; }
  li { margin-left:18px; }
  .meta { background:#faf7ee; border:1px solid #eadfbe; border-radius:12px; padding:14px; margin:18px 0; font-size:13px; }
  footer { margin-top:28px; border-top:1px solid #ddd; padding-top:12px; font-size:11px; color:#666; }
</style></head><body>
<header>
  <div class="kicker">Project Discovery Summary</div>
  <div class="brand">PIXEL<span>SPARK</span></div>
</header>
<div class="meta">
  <strong>${escapeHtml(brief.business_name ?? brief.client_name ?? "Your project")}</strong><br/>
  Recommended package: ${escapeHtml(brief.recommended_plan ?? "—")}<br/>
  Estimated project range: ${escapeHtml(brief.estimated_range ?? "—")}<br/>
  Estimated timeline: ${escapeHtml(brief.estimated_timeline ?? brief.timeline ?? "—")}
</div>
${body}
<footer>
  Estimated project range — final quote subject to scope confirmation. This is a project proposal / discovery summary, not an invoice.<br/>
  PixelSpark · Mohammed · WhatsApp +234 708 158 0318 · pixelsparkx@gmail.com
</footer>
<script>window.onload = () => window.print();</script>
</body></html>`;
}

/** Opens a print-ready, PixelSpark-branded proposal window (Save as PDF). Returns false if pop-ups are blocked. */
export function downloadProposal(brief: GoldieBrief) {
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
  if (!win) return false;
  win.document.write(buildProposalHtml(brief));
  win.document.close();
  return true;
}
