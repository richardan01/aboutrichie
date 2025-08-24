import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listThreads = query({
  args: {},
  handler: async (ctx) => {
    // Get current user (authenticated or anonymous)
    const userId = await getAuthUserId(ctx);
    
    // SECURITY: Anonymous users should NEVER see any threads
    if (!userId) {
      console.log("🚫 Anonymous user requesting threads - returning empty array");
      return [];
    }
    
    // SECURITY: Only authenticated users with valid userId can see threads
    // Get threads for this specific user using the userId index
    const threads = await ctx.db
      .query("threads")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("userId"), undefined))
      .filter((q) => q.neq(q.field("userId"), null))
      .filter((q) => q.eq(q.field("userId"), userId)) // Double-check user ownership
      .order("desc")
      .take(50);

    console.log(`📋 Returning ${threads.length} threads for user ${userId}`);
    
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
    
    // SECURITY: Anonymous users should NEVER see any messages
    if (!userId) {
      console.log("🚫 Anonymous user requesting messages - returning empty array");
      return [];
    }
    
    // First check if the user owns the thread
    const thread = await ctx.db
      .query("threads")
      .withIndex("threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      console.log("🚫 Thread not found:", args.threadId);
      return [];
    }

    // SECURITY: Check if user owns this thread
    if (!thread.userId || thread.userId !== userId) {
      console.log("🚫 Access denied - user doesn't own thread:", args.threadId);
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("threadId", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();

    console.log(`📨 Returning ${messages.length} messages for thread ${args.threadId}`);

    return messages.map(message => ({
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    }));
  },
});