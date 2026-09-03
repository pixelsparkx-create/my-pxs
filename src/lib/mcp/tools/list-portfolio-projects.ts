import { defineTool } from "@lovable.dev/mcp-js";
import { portfolio } from "../data";

export default defineTool({
  name: "list_portfolio_projects",
  title: "List portfolio projects",
  description: "List PixelSpark Studio's portfolio projects with categories, summaries and live links.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(portfolio, null, 2) }],
    structuredContent: { projects: portfolio },
  }),
});
