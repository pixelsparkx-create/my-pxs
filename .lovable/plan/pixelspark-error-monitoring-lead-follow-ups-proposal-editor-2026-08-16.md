# PixelSpark: Error Monitoring, Lead Follow-Ups & Proposal Editor

The backend tables for all three systems already exist in the project database (`error_events`, `error_occurrences`, `lead_followups`, `proposals`, `proposal_versions`, plus helper functions `log_error_event` and `create_draft_proposal`). Nothing in the app uses them yet, so this work is mostly the reporting layer and the admin interfaces. No existing feature changes behaviour.

## 1. Error tracking & System Health

- A small logging helper that records errors with a stable fingerprint (type + route + operation), so repeats increase an occurrence counter instead of creating duplicates.
- Client capture: global JS errors, unhandled rejections, a React error boundary, plus explicit calls at the risky points — Goldie AI replies, proposal/PDF generation, lead submission, testimonial submission, form and auth failures.
- Server capture: the Goldie API route and server helpers report failures with feature/operation context.
- Severity levels INFO / WARNING / ERROR / CRITICAL; Goldie operations tagged (AI_RESPONSE, PROPOSAL_GENERATION, PDF_GENERATION, LEAD_SUBMISSION, etc.); proposal errors carry proposal + lead IDs.
- Never logs passwords, tokens, keys or payment data; only admins can read logs.
- Visitors keep seeing friendly messages ("Goldie ran into a small problem…") with Try Again / Continue Chat.
- New admin tab **System Health**: totals, critical, unresolved, today/this week, most frequent errors, affected features, recent errors. Clicking one opens details (message, stack, first/last seen, occurrences, route, feature, related Goldie session / lead / proposal, recent occurrences) with status control (Open, Investigating, Resolved, Ignored) and private admin notes.

## 2. Automated lead follow-ups

- New admin tab **Follow-Ups** grouped into Today, Upcoming, Overdue, Completed, each card showing the lead, proposal/plan, amount and due time with View Lead / Mark Complete / Reschedule.
- Scheduling from any lead: Tomorrow, In 3 days, In 7 days, In 14 days, or a custom date/time, with private notes.
- Suggestions (not automatic sending): after a proposal is generated, after no response, after contact. Nothing is ever messaged to a client automatically.
- Pipeline rules: lead moved to QUOTED suggests a follow-up; WON or LOST cancels pending sales follow-ups.
- A single grouped reminder banner in admin ("3 follow-ups due today · 1 overdue").

## 3. Proposal system & editor

- New admin tab **Proposals**: list of proposals with reference (e.g. PROPOSAL-8F92), client, status, version and quote.
- Create a proposal from a Goldie lead — it pre-fills client, project, brief content, plan, estimated range and timeline.
- Visual editor (no raw HTML): title, subtitle, client, project, description, pricing, estimated range, official quote, timeline, support period, notes, terms.
- Section manager over the 16 standard sections (Cover, Client Info, Overview, Goals, Recommended Solution, Pages, Features, Integrations, Design Direction, Package, Additional Requirements, Pricing, Timeline, Support, Next Steps, Contact): reorder, show/hide, rename, edit content, plus custom sections.
- Pricing: Goldie's estimate stays an estimate; admin converts it into an Official Quote which is then displayed prominently.
- Versioning: each save creates a version with number, timestamp, editor, change summary, previous and new pricing; past versions viewable.
- Branding within safe limits: logo, accent and secondary accent, header/footer/cover style, white-black-gold default.
- Templates: PixelSpark Premium, Minimal Business, Luxury Hospitality — chosen per proposal.
- Live preview matching the PDF, with Edit / Preview / Export PDF / Save Version. PDF export uses a print-optimised branded layout with controlled page breaks, headers and footers.

## Build order

1. Error logging helper + client/server capture + System Health tab.
2. Follow-ups (scheduling, dashboard, pipeline rules, reminders).
3. Proposal editor, versioning, templates and PDF export.

## Technical notes

- Errors are written through the existing `log_error_event` database function so deduplication and occurrence counting happen server-side; reads are admin-only via existing policies.
- Admin UI is added as new tabs/panels inside `src/routes/admin.tsx`, with each system in its own component file to keep the route readable.
- Proposal HTML/PDF builds on the existing `src/lib/goldie/proposal.ts` renderer, extended with sections, templates and branding.
