import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type AiProvider = {
  model: LanguageModel;
  getRunId: () => string | undefined;
  waitForRunId: () => Promise<string | undefined>;
};

/**
 * Goldie runs on Google's Gemini API directly (native provider, server-side only).
 * Set GOOGLE_AI_API_KEY (or GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY) in the
 * hosting environment. Lovable AI is no longer used.
 */
export function resolveAiProvider(_initialRunId?: string): AiProvider | null {
  const apiKey =
    process.env["GOOGLE_AI_API_KEY"] ||
    process.env["GEMINI_API_KEY"] ||
    process.env["GOOGLE_GENERATIVE_AI_API_KEY"];

  if (!apiKey) return null;

  const google = createGoogleGenerativeAI({ apiKey });

  return {
    model: google(process.env["GOOGLE_AI_MODEL"] || "gemini-3.6-flash"),
    getRunId: () => undefined,
    waitForRunId: async () => undefined,
  };
}

export const AI_UNCONFIGURED_MESSAGE =
  "Goldie isn't connected yet — the Google AI key is missing on this deployment. Please reach us on WhatsApp in the meantime.";
