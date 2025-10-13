import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { AiAgentPersona } from "./schema/aiAgentPersona.schema";
import { Users } from "./schema/users.schema";

const schema = defineSchema({
  users: Users.table
    .index("externalId", ["externalId"])
    .index("email", ["email"]),
  aiAgentPersona: AiAgentPersona.table.index("agentId", ["agentId"]),
  threads: defineTable({
    threadId: v.string(),
    title: v.string(),
    createdAt: v.number(),
    lastMessageAt: v.number(),
    userId: v.optional(v.id("users")),
    anonymousUserId: v.optional(v.string()),
  })
    .index("threadId", ["threadId"])
    .index("createdAt", ["createdAt"])
    .index("userId", ["userId"])
    .index("anonymousUserId", ["anonymousUserId"]),
  messages: defineTable({
    threadId: v.string(),
    userQuery: v.optional(v.string()),
    assistantResponse: v.optional(v.string()),
    // Legacy fields (backwards compatibility)
    role: v.optional(v.union(v.literal("user"), v.literal("assistant"))),
    content: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("threadId", ["threadId"])
    .index("timestamp", ["timestamp"]),
  usageData: defineTable({
    threadId: v.string(),
    userId: v.optional(v.string()),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    timestamp: v.number(),
  })
    .index("threadId", ["threadId"])
    .index("userId", ["userId"])
    .index("timestamp", ["timestamp"]),
});

export default schema;
