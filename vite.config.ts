// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    // Prerender routes to static HTML so the site can be deployed as a
    // static bundle (e.g. Netlify publishing dist/client).
    prerender: { enabled: true, crawlLinks: true },
  },
  vite: {
    plugins: [
      mcpPlugin(),
      {
        // `cloudflare:workers` is a Cloudflare-only virtual module used by
        // @lovable.dev/mcp-js. Externalize it so non-Cloudflare builds
        // (e.g. Netlify's nitro build) don't try to resolve it at build time.
        name: "externalize-cloudflare-workers",
        resolveId(id: string) {
          if (id === "cloudflare:workers") return { id, external: true };
        },
      },
    ],
  },
});
