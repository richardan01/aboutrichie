import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listThreads = query({
  args: {},
  handler: async (ctx) => {
    // Get current user (authenticated or anonymous)
    const userId = await getAuthUserId(ctx);
    
    let threads;
    
    if (userId) {
      // For authenticated users, get their threads
      threads = await ctx.db
        .query("threads")
        .withIndex("userId", (q) => q.eq("userId", userId))
        .filter((q) => q.neq(q.field("userId"), undefined))
        .filter((q) => q.neq(q.field("userId"), null))
        .filter((q) => q.eq(q.field("userId"), userId)) // Double-check user ownership
        .order("desc")
        .take(50);
      
    } else {
      // For anonymous users, we'll use localStorage on the client side
      // Return empty array but allow the client to manage local threads
      return [];
    }
    
    return threads.map(thread => ({
      _id: thread._id,
      threadId: thread.threadId,
      title: thread.title,
      createdAt: thread.createdAt,
      lastMessageAt: thread.lastMessageAt,
    }));
  },
});

export const getThread = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const thread = await ctx.db
      .query("threads")
      .withIndex("threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      return null;
    }

    // Check if user owns this thread (or allow access for anonymous users for now)
    if (userId && thread.userId && thread.userId !== userId) {
      // User doesn't own this thread
      return null;
    }

    return {
      _id: thread._id,
      threadId: thread.threadId,
      title: thread.title,
      createdAt: thread.createdAt,
      lastMessageAt: thread.lastMessageAt,
    };
  },
});

export const getMessages = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    // First check if the thread exists
    const thread = await ctx.db
      .query("threads")
      .withIndex("threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      return [];
    }

    // SECURITY: Check access permissions
    // - Authenticated users can only access their own threads
    // - Anonymous users can only access threads that don't have a userId (anonymous threads)
    if (userId) {
      // Authenticated user - must own the thread
      if (thread.userId && thread.userId !== userId) {
        return [];
      }
    } else {
      // Anonymous user - can only access anonymous threads
      if (thread.userId) {
        return [];
      }
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("threadId", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();


    return messages.map(message => ({
      userQuery: message.userQuery,
      assistantResponse: message.assistantResponse,
      timestamp: message.timestamp,
    }));
  },
});

export const getUsageStats = query({
  args: {
    userId: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let usageData = await ctx.db
      .query("usageData")
      .order("desc")
      .collect();

    // Filter by userId if provided
    if (args.userId) {
      usageData = usageData.filter(data => data.userId === args.userId);
    }

    // Filter by date range if provided
    if (args.startDate) {
      usageData = usageData.filter(data => data.timestamp >= args.startDate!);
    }
    if (args.endDate) {
      usageData = usageData.filter(data => data.timestamp <= args.endDate!);
    }

    // Calculate totals
    const totalPromptTokens = usageData.reduce((sum, data) => sum + data.promptTokens, 0);
    const totalCompletionTokens = usageData.reduce((sum, data) => sum + data.completionTokens, 0);
    const totalTokens = usageData.reduce((sum, data) => sum + data.totalTokens, 0);
    const totalRequests = usageData.length;

    // Group by model
    const byModel = usageData.reduce((acc, data) => {
      if (!acc[data.model]) {
        acc[data.model] = {
          model: data.model,
          requests: 0,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        };
      }
      acc[data.model].requests++;
      acc[data.model].promptTokens += data.promptTokens;
      acc[data.model].completionTokens += data.completionTokens;
      acc[data.model].totalTokens += data.totalTokens;
      return acc;
    }, {} as Record<string, {
      model: string;
      requests: number;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    }>);

    return {
      summary: {
        totalRequests,
        totalPromptTokens,
        totalCompletionTokens,
        totalTokens,
      },
      byModel: Object.values(byModel),
      recentUsage: usageData.slice(0, 10).map(data => ({
        threadId: data.threadId,
        model: data.model,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        totalTokens: data.totalTokens,
        timestamp: data.timestamp,
      })),
    };
  },
});

export const getThreadUsage = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const usageData = await ctx.db
      .query("usageData")
      .withIndex("threadId", (q) => q.eq("threadId", args.threadId))
      .collect();

    const totalPromptTokens = usageData.reduce((sum, data) => sum + data.promptTokens, 0);
    const totalCompletionTokens = usageData.reduce((sum, data) => sum + data.completionTokens, 0);
    const totalTokens = usageData.reduce((sum, data) => sum + data.totalTokens, 0);

    return {
      threadId: args.threadId,
      totalRequests: usageData.length,
      totalPromptTokens,
      totalCompletionTokens,
      totalTokens,
      history: usageData.map(data => ({
        model: data.model,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        totalTokens: data.totalTokens,
        timestamp: data.timestamp,
      })),
    };
  },
});