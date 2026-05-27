"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Agent, run } from "@openai/agents";
import { generateSystemInstructions } from "../helpers/systemPrompt";
import { rateLimiter } from "../rateLimiter";

const MODEL = "gpt-4o-mini";

// In-memory cache for active sessions. This is a best-effort cache only —
// it is NOT reliable as sole storage because Convex workers can be recycled
// at any time (cold starts, deployments, idle). The database is the source
// of truth; this cache just reduces latency within a single warm worker.
type ConversationMessage = {role: 'user' | 'assistant', content: string, timestamp: number};
const conversations = new Map<string, ConversationMessage[]>();

type DbMessageRow = { userQuery: string; assistantResponse: string; timestamp: number };

/**
 * Load conversation history from DB and convert the pair-per-row storage format
 * ({userQuery, assistantResponse}) into the role-per-message format used in memory.
 */
async function loadFromDb(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: { runQuery: (ref: any, args: any) => Promise<DbMessageRow[]> },
  threadId: string
): Promise<ConversationMessage[]> {
  const dbMessages = await ctx.runQuery(api.chat.queries.getMessages, { threadId });

  const result: ConversationMessage[] = [];
  for (const msg of dbMessages) {
    if (msg.userQuery) {
      result.push({ role: "user", content: msg.userQuery, timestamp: msg.timestamp });
    }
    if (msg.assistantResponse) {
      // +1 ms so the assistant message sorts after the user message with the same timestamp
      result.push({ role: "assistant", content: msg.assistantResponse, timestamp: msg.timestamp + 1 });
    }
  }
  return result;
}

export const sendMessage = action({
  args: {
    threadId: v.string(),
    message: v.string(),
  },
  returns: v.object({
    response: v.string(),
    traceId: v.optional(v.string()),
    tokenUsage: v.union(v.object({
      prompt_tokens: v.number(),
      completion_tokens: v.number(),
      total_tokens: v.number(),
      prompt_tokens_details: v.optional(v.object({
        cached_tokens: v.optional(v.number()),
        audio_tokens: v.optional(v.number()),
      })),
      completion_tokens_details: v.optional(v.object({
        reasoning_tokens: v.optional(v.number()),
        audio_tokens: v.optional(v.number()),
        accepted_prediction_tokens: v.optional(v.number()),
        rejected_prediction_tokens: v.optional(v.number()),
      })),
    }), v.null()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // Get current user for security
      const userId = await getAuthUserId(ctx);

      // --- Rate limiting ---
      // Enforce per-minute and per-day caps to protect OpenAI API costs.
      const rateLimitKey = userId ?? args.threadId;
      const perMinuteResult = await rateLimiter.limit(ctx, "sendAIMessage", {
        key: rateLimitKey,
        throws: false,
      });
      if (!perMinuteResult.ok) {
        return {
          response: "You've sent too many messages. Please wait a moment before trying again.",
          tokenUsage: null,
          error: "rate_limit_exceeded",
        };
      }
      const dailyResult = await rateLimiter.limit(ctx, "sendAIMessageDaily", {
        key: rateLimitKey,
        throws: false,
      });
      if (!dailyResult.ok) {
        return {
          response: "You've reached the daily message limit. Please check back tomorrow!",
          tokenUsage: null,
          error: "daily_rate_limit_exceeded",
        };
      }

      // Create conversation key - for anonymous users, just use the threadId
      const conversationKey = userId ? `${userId}:${args.threadId}` : args.threadId;

      // Get or create conversation — prefer the in-memory cache but fall back to DB
      // so conversation context survives cold starts.
      const isNewThread = !conversations.has(conversationKey);
      if (isNewThread) {
        // Try to load existing conversation from DB first
        try {
          const dbHistory = await loadFromDb(ctx, args.threadId);
          conversations.set(conversationKey, dbHistory);
        } catch (loadError) {
          console.warn("[CHAT] Could not load conversation history from DB, starting fresh:", loadError);
          conversations.set(conversationKey, []);
        }

        // Store thread metadata in database (only if truly new)
        if (!conversations.get(conversationKey)?.length) {
          try {
            await ctx.runMutation(api.chat.mutations.createThread, {
              threadId: args.threadId,
              title: args.message.substring(0, 50) + (args.message.length > 50 ? "..." : ""),
              createdAt: Date.now(),
              lastMessageAt: Date.now(),
            });
          } catch (error) {
            console.warn("[CHAT] Could not create thread metadata:", error);
          }
        }
      }

      const conversation = conversations.get(conversationKey)!;

      // Add user message
      const userMessageTimestamp = Date.now();
      conversation.push({
        role: "user",
        content: args.message,
        timestamp: userMessageTimestamp,
      });

      // Create system instructions for Richard using structured data
      const systemInstructions = generateSystemInstructions();

      // Create agent with tracing enabled (default)
      const agent = new Agent({
        name: "Richard AI Assistant",
        instructions: systemInstructions,
        model: MODEL,
      });

      // Build conversation context (exclude the message we just added)
      const conversationHistory = conversation
        .slice(0, -1)
        .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n\n");

      const fullPrompt = conversationHistory
        ? `${conversationHistory}\n\nUser: ${args.message}`
        : args.message;

      console.log("[CHAT] Using OpenAI Agents SDK with tracing", {
        threadId: args.threadId,
        messagePreview: args.message.substring(0, 80),
        conversationLength: conversation.length,
        model: MODEL,
      });

      // Run agent with tracing automatically enabled
      const result = await run(agent, fullPrompt);

      const response = result.finalOutput || "I'm sorry, I couldn't generate a response.";

      console.log("[CHAT] Agents SDK response OK (traced)", {
        responseLength: response?.length ?? 0,
      });

      // Note: The OpenAI Agents SDK (@openai/agents) does not currently expose
      // per-call token usage on the RunResult object. Usage is tracked internally
      // via OpenAI's tracing dashboard. Until the SDK exposes usage, we store zeros
      // and rely on the OpenAI dashboard for cost monitoring.
      const usage = {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      };

      console.log("📊 OpenAI Agents call completed with tracing", {
        model: MODEL,
        threadId: args.threadId,
        userId: userId || undefined,
      });

      // Save usage data to database
      try {
        await ctx.runMutation(api.chat.mutations.saveUsageData, {
          threadId: args.threadId,
          userId: userId || undefined,
          model: MODEL,
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("[CHAT] Failed to save usage data:", error);
      }

      // Add assistant message to in-memory conversation
      const now = Date.now();
      conversation.push({
        role: "assistant",
        content: response,
        timestamp: now,
      });

      // Persist message pair to database (source of truth)
      try {
        await ctx.runMutation(api.chat.mutations.saveMessagePair, {
          threadId: args.threadId,
          userQuery: args.message,
          assistantResponse: response,
          timestamp: now,
        });
      } catch (error) {
        console.error("[CHAT] Failed to persist message pair:", error);
      }

      // Update thread lastMessageAt timestamp
      try {
        await ctx.runMutation(api.chat.mutations.updateThreadLastMessage, {
          threadId: args.threadId,
          lastMessageAt: now,
        });
      } catch (error) {
        console.warn("[CHAT] Failed to update thread lastMessageAt:", error);
      }

      return {
        response,
        traceId: undefined, // OpenAI Agents SDK handles tracing internally
        tokenUsage: {
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
        },
      };

    } catch (error) {
      console.error("[CHAT] sendMessage failed with unhandled error:", error);

      return {
        response: "I'm currently experiencing some technical difficulties. Please try again in a moment.",
        tokenUsage: null,
        error: "Fallback response due to API error",
      };
    }
  },
});

export const getConversation = action({
  args: {
    threadId: v.string(),
  },
  returns: v.array(v.object({
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  })),
  handler: async (ctx, args) => {
    // Get current user for security
    const userId = await getAuthUserId(ctx);

    // Create conversation key - for anonymous users, just use the threadId
    const conversationKey = userId ? `${userId}:${args.threadId}` : args.threadId;

    // Check in-memory cache first (may be empty after a cold start)
    let conversation = conversations.get(conversationKey) || [];

    if (conversation.length === 0) {
      // Load from DB — the reliable source of truth
      try {
        const dbHistory = await loadFromDb(ctx, args.threadId);
        if (dbHistory.length > 0) {
          conversation = dbHistory;
          conversations.set(conversationKey, conversation);
        }
      } catch (error) {
        console.error("[CHAT] Failed to load conversation from DB:", error);
      }
    }

    return conversation;
  },
});

export const deleteConversation = action({
  args: {
    threadId: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // Get current user for security
      const userId = await getAuthUserId(ctx);

      // Create conversation key - for anonymous users, just use the threadId
      const conversationKey = userId ? `${userId}:${args.threadId}` : args.threadId;

      // Clear in-memory cache
      conversations.delete(conversationKey);

      // Remove from database (source of truth)
      await ctx.runMutation(api.chat.mutations.deleteThread, {
        threadId: args.threadId,
      });

      return { success: true };
    } catch (error) {
      console.error("[CHAT] deleteConversation failed:", error);
      return { success: false, error: (error as Error).message };
    }
  },
});
