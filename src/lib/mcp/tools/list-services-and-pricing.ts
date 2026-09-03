import { defineTool } from "@lovable.dev/mcp-js";
import { pricing, services } from "../data";

export default defineTool({
  name: "list_services_and_pricing",
  title: "List services and pricing",
  description: "List the studio's services and its pricing tiers with what each package includes.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify({ services, pricing }, null, 2) }],
    structuredContent: { services, pricing },
  }),
});
