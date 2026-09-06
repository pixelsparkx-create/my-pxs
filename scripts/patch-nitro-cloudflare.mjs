// Postinstall patch: nitro's Cloudflare runtime mutates the incoming Request
// (req.ip, req.runtime, req.waitUntil). On real Cloudflare Workers that works,
// but in plain-Node contexts (TanStack Start prerender / vite preview, e.g.
// during a Netlify build) the Request is immutable and the assignment throws,
// failing every prerendered page with a 500. Wrap the augmentation in a
// try/catch so it degrades gracefully outside Cloudflare.
import fs from "node:fs";

const file = "node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs";

if (!fs.existsSync(file)) {
  console.log("[patch-nitro-cloudflare] nitro runtime not found, skipping");
  process.exit(0);
}

let source = fs.readFileSync(file, "utf8");

const open = "export function augmentReq(cfReq, ctx) {";
const close = 'req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);\n}';

if (!source.includes(open) || !source.includes(close)) {
  console.log("[patch-nitro-cloudflare] augmentReq shape changed, skipping");
  process.exit(0);
}

if (source.includes("/* patched: tolerate immutable Request */")) {
  console.log("[patch-nitro-cloudflare] already patched");
  process.exit(0);
}

source = source
  .replace(open, `${open}\n\t/* patched: tolerate immutable Request */\n\ttry {`)
  .replace(
    close,
    'req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);\n\t} catch {\n\t\t// Request is immutable outside Cloudflare (prerender/preview) — skip augmentation.\n\t}\n}',
  );

fs.writeFileSync(file, source);
console.log("[patch-nitro-cloudflare] patched nitro cloudflare runtime");
