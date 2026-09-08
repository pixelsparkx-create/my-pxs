// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

=======
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, componentTagger (dev-only),
//     VITE_* env injection, @ path alias, React/TanStack dedupe, error logger plugins.
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// Deploy to Netlify with SSR via app.config.ts (server.preset: 'netlify')
>>>>>>> e73f5dfe593dc628a091cca98030561f7bbe1364
export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this.
    server: { entry: "server" },
    // SPA mode disabled — using Netlify's SSR via TanStack Start preset
    spa: { enabled: false },
  },
  // Target Netlify for clean 2026 deployments. This preset is honored when
  // building outside the Lovable sandbox (e.g., Netlify CI / CLI).
  nitro: {
    preset: "netlify",
=======
  vite: {
    plugins: [
      mcpPlugin(),
      {
        // TanStack Start's prerender step expects dist/server/server.js, but
        // the custom server entry builds to dist/server/index.mjs. Bridge the
        // two before prerendering runs (enforce: "pre" => earlier closeBundle).
        name: "prerender-server-entry-bridge",
        enforce: "pre",
        closeBundle() {
          try {
            if (
              fs.existsSync("dist/server/index.mjs") &&
              !fs.existsSync("dist/server/server.js")
            ) {
              fs.copyFileSync("dist/server/index.mjs", "dist/server/server.js");
            }
          } catch {
            // best-effort; only needed for prerender builds
          }
        },
      },
    ],
>>>>>>> e73f5dfe593dc628a091cca98030561f7bbe1364
  },
});
