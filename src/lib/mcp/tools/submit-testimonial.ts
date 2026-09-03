import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "submit_testimonial",
  title: "Submit a testimonial",
  description:
    "Submit a client testimonial for review. Submissions are held until approved before appearing on the site.",
  inputSchema: {
    full_name: z.string().trim().min(1).describe("The client's full name (kept private)."),
    display_name: z.string().trim().min(1).describe("Public display name, e.g. 'Sarah A.'"),
    title: z.string().trim().min(1).describe("Role or company, e.g. 'Founder, Tranquil Oasis'."),
    rating: z.number().int().min(1).max(5).describe("Rating from 1 to 5."),
    message: z.string().trim().min(1).describe("The testimonial text."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { error } = await supabaseForUser(ctx).from("testimonials").insert({
      full_name: input.full_name,
      display_name: input.display_name,
      title: input.title,
      rating: input.rating,
      message: input.message,
    });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: "Testimonial submitted and awaiting approval." }],
      structuredContent: { submitted: true },
    };
  },
});
