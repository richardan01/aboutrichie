"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Agent, run } from "@openai/agents";
import { generateSystemInstructions } from "../helpers/systemPrompt";

// Simple message storage
type ConversationMessage = {role: 'user' | 'assistant', content: string, timestamp: number};
const conversations = new Map<string, ConversationMessage[]>();

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
      
      // Create conversation key - for anonymous users, just use the threadId
      const conversationKey = userId ? `${userId}:${args.threadId}` : args.threadId;
      
      // Get or create conversation
      const isNewThread = !conversations.has(conversationKey);
      if (isNewThread) {
        conversations.set(conversationKey, []);
        
        // Store thread metadata in database
        try {
          await ctx.runMutation(api.chat.mutations.createThread, {
            threadId: args.threadId,
            title: args.message.substring(0, 50) + (args.message.length > 50 ? "..." : ""),
            createdAt: Date.now(),
            lastMessageAt: Date.now(),
          });
        } catch (error) {
          // Ignore metadata creation errors
        }
      }
      
      const conversation = conversations.get(conversationKey)!;
      
      // Add user message
      const userMessageTimestamp = Date.now();
      conversation.push({
        role: 'user',
        content: args.message,
        timestamp: userMessageTimestamp
      });

      // Create system instructions for Richard using structured data
      const systemInstructions = generateSystemInstructions();

      // Create agent with tracing enabled (default)
      const agent = new Agent({
        name: "Richard AI Assistant",
        instructions: systemInstructions,
        model: "gpt-4o-mini",
      });

      // Build conversation context
      const conversationHistory = conversation
        .slice(0, -1) // Exclude the current message
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const fullPrompt = conversationHistory
        ? `${conversationHistory}\n\nUser: ${args.message}`
        : args.message;

      console.log("[CHAT] Using OpenAI Agents SDK with tracing", {
        threadId: args.threadId,
        messagePreview: args.message.substring(0, 80),
        conversationLength: conversation.length,
      });

      // Run agent with tracing automatically enabled
      const result = await run(agent, fullPrompt);

      const response = result.finalOutput || "I'm sorry, I couldn't generate a response.";

      console.log("[CHAT] Agents SDK response OK (traced)", {
        responseLength: response?.length ?? 0,
      });

      // Extract usage from result - OpenAI Agents SDK may not expose these directly
      const usage = {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      };

      // Log OpenAI usage for tracking
      console.log("📊 OpenAI Agents call completed with tracing", {
        model: "gpt-4o-mini",
        threadId: args.threadId,
        userId: userId || undefined,
        usage,
      });

      // Save usage data to database
      try {
        await ctx.runMutation(api.chat.mutations.saveUsageData, {
          threadId: args.threadId,
          userId: userId || undefined,
          model: "gpt-4o-mini",
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Failed to save usage data:", error);
      }

      // Add assistant message to conversation
      const now = Date.now();
      conversation.push({
        role: 'assistant',
        content: response,
        timestamp: now
      });

      // Save message pair to database
      try {
        await ctx.runMutation(api.chat.mutations.saveMessagePair, {
          threadId: args.threadId,
          userQuery: args.message,
          assistantResponse: response,
          timestamp: now,
        });
      } catch (error) {
        // Ignore save errors
      }

      // Update thread lastMessageAt timestamp
      try {
        await ctx.runMutation(api.chat.mutations.updateThreadLastMessage, {
          threadId: args.threadId,
          lastMessageAt: now,
        });
      } catch (error) {
        // Ignore timestamp update errors
      }

      return {
        response,
        traceId: undefined, // OpenAI Agents SDK handles tracing internally
        tokenUsage: usage ? {
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
          prompt_tokens_details: usage.prompt_tokens_details ? {
            cached_tokens: usage.prompt_tokens_details.cached_tokens,
            audio_tokens: usage.prompt_tokens_details.audio_tokens,
          } : undefined,
          completion_tokens_details: usage.completion_tokens_details ? {
            reasoning_tokens: usage.completion_tokens_details.reasoning_tokens,
            audio_tokens: usage.completion_tokens_details.audio_tokens,
            accepted_prediction_tokens: usage.completion_tokens_details.accepted_prediction_tokens,
            rejected_prediction_tokens: usage.completion_tokens_details.rejected_prediction_tokens,
          } : undefined,
        } : null,
      };

    } catch (error) {
      
      // Return fallback response
      const fallbackResponse = `I'm currently experiencing some technical difficulties. Please try again in a moment.`;
      
      return {
        response: fallbackResponse,
        tokenUsage: null,
        error: "Fallback response due to API error"
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
    
    // First try to get from memory
    let conversation = conversations.get(conversationKey) || [];
    
    if (conversation.length === 0) {
      // If not in memory, try to load from database
      try {
        const dbMessages = await ctx.runQuery(api.chat.queries.getMessages, {
          threadId: args.threadId,
        });
        
        if (dbMessages && dbMessages.length > 0) {
          conversation = dbMessages;
          // Also populate the in-memory cache
          conversations.set(conversationKey, conversation);
        }
      } catch (error) {
        // Ignore database load errors
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
      
      // Remove from in-memory storage
      conversations.delete(conversationKey);
      
      // Remove from database
      await ctx.runMutation(api.chat.mutations.deleteThread, {
        threadId: args.threadId,
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
});
