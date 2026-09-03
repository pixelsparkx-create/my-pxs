import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

export type AiProvider = {
  model: ReturnType<ReturnType<typeof createOpenAICompatible>>;
  getRunId: () => string | undefined;
  waitForRunId: () => Promise<string | undefined>;
};

/**
 * Resolve the AI provider Goldie should use.
 *
 * 1. Inside Lovable: LOVABLE_API_KEY is injected and the Lovable AI gateway is used.
 * 2. Standalone: set GOOGLE_AI_API_KEY (free tier at aistudio.google.com) and the
 *    Gemini OpenAI-compatible endpoint is used directly.
 * 3. Neither: returns null so the caller can degrade with a clear message
 *    instead of throwing a 500.
 */
export function resolveAiProvider(initialRunId?: string): AiProvider | null {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (lovableKey) {
    const gateway = createLovableAiGatewayProvider(lovableKey, initialRunId);
    return {
      model: gateway(process.env["LOVABLE_AI_MODEL"] || "google/gemini-3.6-flash"),
      getRunId: gateway.getRunId,
      waitForRunId: gateway.waitForRunId,
    };
  }

  const googleKey = process.env["GOOGLE_AI_API_KEY"];
  if (googleKey) {
    const provider = createOpenAICompatible({
      name: "google-ai-studio",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
      supportsStructuredOutputs: false,
      headers: { Authorization: `Bearer ${googleKey}` },
    });
    return {
      model: provider(process.env["GOOGLE_AI_MODEL"] || "gemini-2.5-flash"),
      getRunId: () => undefined,
      waitForRunId: async () => undefined,
    };
  }

  return null;
}

export const AI_UNCONFIGURED_MESSAGE =
  "Goldie isn't connected to an AI provider yet. Set GOOGLE_AI_API_KEY (free at aistudio.google.com) or LOVABLE_API_KEY, then try again — or reach us on WhatsApp in the meantime.";
