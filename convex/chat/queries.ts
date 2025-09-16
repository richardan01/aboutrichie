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
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    }));
  },
});