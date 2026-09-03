import type { Proposal, ProposalSection } from "./schema";

function escapeHtml(value: string) {
  return value.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);
}

function bodyToHtml(body: string) {
  const lines = body.split("\n");
  const out: string[] = [];
  let inList = false;
  for (const line of lines) {
    const safe = escapeHtml(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    const isBullet = /^\s*[-*•]\s+/.test(line);
    if (isBullet) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${safe.replace(/^\s*[-*•]\s+/, "")}</li>`);
      continue;
    }
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
    if (!line.trim()) continue;
    out.push(`<p>${safe}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

function templateStyle(template: string) {
  if (template === "minimal") {
    return {
      font: `"Helvetica Neue", Arial, sans-serif`,
      coverBg: "#ffffff",
      coverColor: "#111111",
      sectionCase: "none",
      rule: "1px solid #e5e5e5",
    };
  }
  if (template === "hospitality") {
    return {
      font: `Georgia, "Times New Roman", serif`,
      coverBg: "#2B211A",
      coverColor: "#ffffff",
      sectionCase: "uppercase",
      rule: "1px solid #e6dccb",
    };
  }
  return {
    font: `-apple-system, "Segoe UI", Inter, sans-serif`,
    coverBg: "#111111",
    coverColor: "#ffffff",
    sectionCase: "uppercase",
    rule: "1px solid #eee",
  };
}

/** Renders the print/PDF-ready proposal document. Preview and export share this markup. */
export function buildProposalDocument(proposal: Proposal, options: { print?: boolean } = {}) {
  const style = templateStyle(proposal.template);
  const accent = proposal.accent_color || "#C9A227";
  const secondary = proposal.secondary_color || "#111111";
  const sections = (proposal.sections ?? []).filter((s: ProposalSection) => s.enabled);
  const quote = proposal.official_quote?.trim();

  const cover = sections.find((s) => s.id === "cover");
  const rest = sections.filter((s) => s.id !== "cover");

  const body = rest
    .map(
      (section) => `
  <section class="block">
    <h2>${escapeHtml(section.title)}</h2>
    ${
      section.id === "pricing"
        ? `<div class="quote">
            ${proposal.estimated_range ? `<div class="est">Goldie estimate: ${escapeHtml(proposal.estimated_range)}</div>` : ""}
            ${quote ? `<div class="official">Official quote: <strong>${escapeHtml(quote)}</strong></div>` : `<div class="est">Official quote pending confirmation.</div>`}
          </div>`
        : ""
    }
    ${bodyToHtml(section.body)}
  </section>`,
    )
    .join("\n");

  return `<!doctype html><html><head><meta charset="utf-8" />
<title>${escapeHtml(proposal.title)} — ${escapeHtml(proposal.client_name ?? "PixelSpark")}</title>
<style>
  @page { margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: ${style.font}; color: #141414; line-height: 1.65; margin: 0; padding: 0 0 40px; }
  .cover { background: ${style.coverBg}; color: ${style.coverColor}; padding: 56px 44px; page-break-after: always; }
  .cover .brand { font-size: 13px; letter-spacing: 5px; text-transform: uppercase; opacity: .8; }
  .cover h1 { font-size: 38px; line-height: 1.15; margin: 26px 0 10px; }
  .cover .sub { font-size: 15px; opacity: .85; }
  .cover .meta { margin-top: 40px; font-size: 13px; border-top: 1px solid ${accent}; padding-top: 16px; }
  .cover .ref { color: ${accent}; letter-spacing: 2px; font-size: 12px; }
  .cover img.logo { max-height: 46px; margin-bottom: 18px; }
  .page { padding: 0 44px; }
  .block { page-break-inside: avoid; margin-bottom: 26px; }
  h2 { font-size: 14px; letter-spacing: 1.6px; text-transform: ${style.sectionCase}; color: ${accent}; margin: 26px 0 8px; border-bottom: ${style.rule}; padding-bottom: 6px; }
  p { margin: 8px 0; font-size: 14px; }
  ul { margin: 8px 0 8px 18px; padding: 0; }
  li { font-size: 14px; margin: 4px 0; }
  .quote { background: #faf7ee; border: 1px solid #eadfbe; border-radius: 12px; padding: 14px 16px; margin: 10px 0 14px; }
  .quote .est { font-size: 13px; color: #6b6b6b; }
  .quote .official { font-size: 18px; color: ${secondary}; margin-top: 4px; }
  footer { margin-top: 34px; padding: 14px 44px 0; border-top: 1px solid #ddd; font-size: 11px; color: #6a6a6a; }
</style></head><body>
<div class="cover">
  ${proposal.logo_url ? `<img class="logo" src="${escapeHtml(proposal.logo_url)}" alt="Logo" />` : `<div class="brand">PixelSpark</div>`}
  <div class="ref">${escapeHtml(proposal.reference)}</div>
  <h1>${escapeHtml(proposal.title)}</h1>
  ${proposal.subtitle ? `<div class="sub">${escapeHtml(proposal.subtitle)}</div>` : ""}
  ${cover?.body ? `<div class="sub" style="margin-top:14px">${escapeHtml(cover.body)}</div>` : ""}
  <div class="meta">
    Prepared for: <strong>${escapeHtml(proposal.client_name ?? "—")}</strong><br/>
    Project: ${escapeHtml(proposal.project_name ?? "—")}<br/>
    Package: ${escapeHtml(proposal.recommended_plan ?? "—")}<br/>
    ${quote ? `Official quote: <strong>${escapeHtml(quote)}</strong><br/>` : proposal.estimated_range ? `Estimated range: ${escapeHtml(proposal.estimated_range)}<br/>` : ""}
    Version ${proposal.version} · ${new Date(proposal.updated_at).toLocaleDateString()}
  </div>
</div>
<div class="page">
  ${proposal.description ? `<section class="block">${bodyToHtml(proposal.description)}</section>` : ""}
  ${body}
  ${proposal.notes ? `<section class="block"><h2>Notes</h2>${bodyToHtml(proposal.notes)}</section>` : ""}
  ${proposal.terms ? `<section class="block"><h2>Terms</h2>${bodyToHtml(proposal.terms)}</section>` : ""}
</div>
<footer>
  ${escapeHtml(proposal.reference)} · PixelSpark · Mohammed · WhatsApp +234 708 158 0318 · pixelsparkx@gmail.com<br/>
  This document is a project proposal, not an invoice. Pricing is valid for 30 days from the date above.
</footer>
${options.print ? `<script>window.onload = () => window.print();</script>` : ""}
</body></html>`;
}

/** Opens the branded proposal in a print window (Save as PDF). False when pop-ups are blocked. */
export function exportProposalPdf(proposal: Proposal) {
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
  if (!win) return false;
  win.document.write(buildProposalDocument(proposal, { print: true }));
  win.document.close();
  return true;
}
