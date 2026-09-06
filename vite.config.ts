// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, componentTagger (dev-only),
//     VITE_* env injection, @ path alias, React/TanStack dedupe, error logger plugins.
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// Deploy to Netlify with SSR via app.config.ts (server.preset: 'netlify')
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    // SPA mode disabled — using Netlify's SSR via TanStack Start preset
    spa: { enabled: false },
  },
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
  },
});
