import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createThread = mutation({
  args: {
    threadId: v.string(),
    title: v.string(),
    createdAt: v.number(),
    lastMessageAt: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    // Check if thread already exists
    const existingThread = await ctx.db
      .query("threads")
      .withIndex("threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (existingThread) {
      // Check if user owns this thread
      if (userId && existingThread.userId && existingThread.userId !== userId) {
        throw new Error("Access denied");
      }
      
      // Update existing thread
      await ctx.db.patch(existingThread._id, {
        lastMessageAt: args.lastMessageAt,
      });
      return existingThread._id;
    }

    // Create new thread with user ownership
    const threadId = await ctx.db.insert("threads", {
      threadId: args.threadId,
      title: args.title,
      createdAt: args.createdAt,
      lastMessageAt: args.lastMessageAt,
      userId: userId || undefined,
    });

    return threadId;
  },
});

export const updateThreadLastMessage = mutation({
  args: {
    threadId: v.string(),
    lastMessageAt: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const thread = await ctx.db
      .query("threads")
      .withIndex("threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (thread) {
      // Check if user owns this thread
      if (userId && thread.userId && thread.userId !== userId) {
        throw new Error("Access denied");
      }
      
      await ctx.db.patch(thread._id, {
        lastMessageAt: args.lastMessageAt,
      });
    }
  },
});

export const deleteThread = mutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const thread = await ctx.db
      .query("threads")
      .withIndex("threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (thread) {
      // Check if user owns this thread
      if (userId && thread.userId && thread.userId !== userId) {
        return { success: false, error: "Access denied" };
      }
      
      // Delete all messages for this thread
      const messages = await ctx.db
        .query("messages")
        .withIndex("threadId", (q) => q.eq("threadId", args.threadId))
        .collect();
      
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
      
      // Delete the thread
      await ctx.db.delete(thread._id);
      return { success: true };
    }

    return { success: false, error: "Thread not found" };
  },
});

export const saveMessage = mutation({
  args: {
    threadId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      role: args.role,
      content: args.content,
      timestamp: args.timestamp,
    });
    
    return messageId;
  },
});

export const cleanupOrphanedThreads = mutation({
  args: {},
  handler: async (ctx) => {
    // Find all threads without proper user ownership
    const orphanedThreads = await ctx.db
      .query("threads")
      .filter((q) => q.eq(q.field("userId"), undefined))
      .collect();
    
    let deletedCount = 0;
    
    for (const thread of orphanedThreads) {
      // Delete all messages for this thread
      const messages = await ctx.db
        .query("messages")
        .withIndex("threadId", (q) => q.eq("threadId", thread.threadId))
        .collect();
      
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
      
      // Delete the thread
      await ctx.db.delete(thread._id);
      deletedCount++;
    }
    
    console.log(`🧹 Cleaned up ${deletedCount} orphaned threads`);
    return { deletedCount };
  },
});