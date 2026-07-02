// Server function for AI chat
// This runs on the server side only

import { createServerFn } from "@tanstack/react-start";
import { sendAIChat, RYOTAQC_SYSTEM_PROMPT } from "./client";

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

interface ChatResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

/**
 * Server function to handle AI chat requests
 * This ensures API keys stay on the server and never exposed to client
 */
export const handleAIChat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown): ChatRequest => {
    if (typeof data !== "object" || !data) {
      throw new Error("Invalid request data");
    }

    const req = data as Record<string, unknown>;

    if (typeof req.message !== "string" || !req.message.trim()) {
      throw new Error("Message is required");
    }

    return {
      message: req.message.trim(),
      conversationHistory: Array.isArray(req.conversationHistory)
        ? req.conversationHistory
        : [],
    };
  })
  .handler(async ({ data }): Promise<ChatResponse> => {
    try {
      const messages = [
        ...(data.conversationHistory || []),
        { role: "user" as const, content: data.message },
      ];

      const response = await sendAIChat(messages, RYOTAQC_SYSTEM_PROMPT);

      if (!response.success) {
        console.error("[AI] Chat failed:", response.error);
        return {
          success: false,
          error: response.error || "AI API returned no response",
        };
      }

      return { success: true, reply: response.message };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown server error";
      console.error("[AI] Server function error:", msg, error);
      return { success: false, error: msg };
    }
  });
