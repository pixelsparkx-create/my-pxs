import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { resolveAiProvider, AI_UNCONFIGURED_MESSAGE } from "@/lib/ai-provider.server";
import { buildSystemPrompt } from "@/lib/goldie/knowledge";
import { reportServerError } from "@/lib/monitoring/report.server";

const briefSchema = z.object({
  client_name: z.string().nullish(),
  contact_email: z.string().nullish(),
  contact_phone: z.string().nullish(),
  business_name: z.string().nullish(),
  business_type: z.string().nullish(),
  location: z.string().nullish(),
  target_audience: z.string().nullish(),
  business_goals: z.array(z.string()).nullish(),
  existing_website: z.string().nullish(),
  project_type: z.string().nullish(),
  required_pages: z.array(z.string()).nullish(),
  required_features: z.array(z.string()).nullish(),
  required_integrations: z.array(z.string()).nullish(),
  design_direction: z.string().nullish(),
  content_available: z.string().nullish(),
  timeline: z.string().nullish(),
  budget: z.string().nullish(),
  recommended_plan: z.string().nullish(),
  estimated_range: z.string().nullish(),
  estimated_timeline: z.string().nullish(),
  complexity: z.string().nullish(),
  additional_requirements: z.array(z.string()).nullish(),
  conversation_summary: z.string().nullish(),
  proposal_markdown: z.string().nullish(),
  ready_for_review: z.boolean().nullish(),
});

export const Route = createFileRoute("/api/goldie")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // A short id per request so streaming diagnostics can be traced end to end.
        const requestId = Math.random().toString(36).slice(2, 10);
        const startedAt = Date.now();
        let firstChunkAt: number | undefined;

        const body = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const gateway = resolveAiProvider();
        if (!gateway) return new Response(AI_UNCONFIGURED_MESSAGE, { status: 503 });

        try {
          const result = streamText({
            model: gateway.model,
            system: buildSystemPrompt(),
            messages: await convertToModelMessages(body.messages as UIMessage[]),
            // Bounded backoff for transient rate limits (429) and upstream 5xx,
            // so a single busy moment no longer surfaces as a user-facing error.
            maxRetries: 3,
            // One tool round-trip is enough; more only multiplied latency and quota.
            stopWhen: stepCountIs(3),
            abortSignal: request.signal,
            onChunk: () => {
              if (firstChunkAt === undefined) {
                firstChunkAt = Date.now();
                console.log(
                  `[goldie] ${requestId} first-chunk in ${firstChunkAt - startedAt}ms`,
                );
              }
            },
            onFinish: ({ finishReason }) => {
              console.log(
                `[goldie] ${requestId} done reason=${finishReason} ttfb=${
                  firstChunkAt ? firstChunkAt - startedAt : -1
                }ms total=${Date.now() - startedAt}ms`,
              );
            },
            tools: {
              update_brief: tool({
                description:
                  "Save or refine what you now know about the visitor's project. Send only the fields you learned; they are merged into the stored project brief.",
                inputSchema: briefSchema,
                execute: async () => ({ saved: true }),
              }),
              suggest_replies: tool({
                description:
                  "Offer 2-4 short, clickable reply suggestions the visitor can tap to answer your latest question or explore an option they may not have considered. Call this alongside your reply whenever useful.",
                inputSchema: z.object({
                  suggestions: z.array(z.string().max(60)).min(2).max(4),
                }),
                execute: async () => ({ shown: true }),
              }),
            },

          });

          const response = result.toUIMessageStreamResponse({
            originalMessages: body.messages as UIMessage[],
            onError: (error) => {
              const message = error instanceof Error ? error.message : String(error);
              // A visitor-cancelled stream is normal, not a failure.
              if (/abort/i.test(message)) return "";
              console.error(`[goldie] ${requestId} stream error`, message);
              void reportServerError({
                message: "Goldie AI stream failed",
                error,
                severity: "error",
                feature: "goldie",
                category: "ai",
                operation: "AI_RESPONSE",
                route: "/api/goldie",
                context: { requestId, elapsedMs: Date.now() - startedAt },
              });
              if (message.includes("429") || /quota|rate limit/i.test(message))
                return "Goldie is getting more requests than the AI plan allows right now. Please try again shortly, or message us on WhatsApp.";
              if (message.includes("401") || message.includes("403") || /api key/i.test(message))
                return "Goldie isn't able to answer right now. Please reach us on WhatsApp and we'll reply personally.";
              if (/timeout|fetch failed|network/i.test(message))
                return "Goldie lost connection for a moment. Please send that again.";
              return "Something went wrong on Goldie's side. Please try again.";
            },
          });

          return response;
        } catch (error) {
          console.error(`[goldie] ${requestId} failed`, error);
          await reportServerError({
            message: "Goldie request failed",
            error,
            severity: "critical",
            feature: "goldie",
            category: "ai",
            operation: "AI_REQUEST",
            route: "/api/goldie",
            context: { requestId, elapsedMs: Date.now() - startedAt },
          });
          return new Response("Goldie is unavailable right now", { status: 500 });
        }
      },
    },
  },
});

