"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import OpenAI from "openai";
import { getAuthUserId } from "@convex-dev/auth/server";

// Simple message storage
const conversations = new Map<string, Array<{role: 'user' | 'assistant', content: string, timestamp: number}>>();

export const sendMessage = action({
  args: {
    threadId: v.string(),
    message: v.string(),
  },
  returns: v.object({
    response: v.string(),
    tokenUsage: v.union(v.object({
      prompt_tokens: v.number(),
      completion_tokens: v.number(),
      total_tokens: v.number(),
    }), v.null()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    console.log("📨 Received message:", args.message);
    console.log("📨 Thread ID:", args.threadId);

    try {
      // Get current user for security
      const userId = await getAuthUserId(ctx);
      
      // Create user-scoped conversation key
      const conversationKey = userId ? `${userId}:${args.threadId}` : `anon:${args.threadId}`;
      
      // Get or create conversation
      const isNewThread = !conversations.has(conversationKey);
      if (isNewThread) {
        conversations.set(conversationKey, []);
        
        // Store thread metadata in database
        console.log("📝 Creating thread metadata for:", args.threadId);
        try {
          await ctx.runMutation(api.chat.mutations.createThread, {
            threadId: args.threadId,
            title: args.message.substring(0, 50) + (args.message.length > 50 ? "..." : ""),
            createdAt: Date.now(),
            lastMessageAt: Date.now(),
          });
          console.log("✅ Thread metadata created successfully");
        } catch (error) {
          console.error("❌ Failed to create thread metadata:", error);
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

      // Save user message to database
      try {
        await ctx.runMutation(api.chat.mutations.saveMessage, {
          threadId: args.threadId,
          role: 'user',
          content: args.message,
          timestamp: userMessageTimestamp,
        });
      } catch (error) {
        console.error("❌ Failed to save user message:", error);
      }

      // Initialize OpenAI
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Create system message for Richard
      const systemMessage = {
        role: 'system' as const,
        content: `You are Richard Ng, a versatile Data Product Manager and AI Product Manager with over 10 years of experience building enterprise data and AI platforms.

IMPORTANT: Tailor your response based on the user's question context:

**IF ASKED ABOUT DATA PRODUCT MANAGEMENT:**
Focus on data infrastructure, analytics, governance, and traditional data product responsibilities:
- Current Role: Data Product Manager at Axicorp (Jan 2024 - Present)
- Data Platform Achievements: Launched Axi Data Marketplace from 0 to 1, 45% boost in data discoverability
- Analytics Leadership: Streamlined 67 reports into 6 key dashboards, reduced operational overhead by 40%
- Data Engineering: Self-service analytics with Databricks, ThoughtSpot, ETL pipelines with PySpark
- Data Governance: Implemented data catalog, lineage, access control, and master data management
- Skills: SQL, Python, Databricks, BigQuery, Azure Data Fabric, Informatica IDMC, data warehousing

**IF ASKED ABOUT AI PRODUCT MANAGEMENT:**
Focus on AI/ML platforms, GenAI, and AI product strategy:
- AI Product Focus: AI & Data Product Manager specializing in GenAI and enterprise AI solutions
- GenAI Achievements: Deployed GenAI Assistant and AI Agent workflows, cutting manual operations by 60%
- AI Platform Development: Built AI-driven evaluation tools, improved labeling productivity by 20%
- ML Product Success: Churn prediction model using Databricks AutoML increased retention by 33%
- AI Innovation: Created AIViralBuzz (GenAI platform), LinkedIn Curator AI, Finance AI Assistant
- AI Governance: Led AI enablement across financial institutions, boosted compliance adoption by 35%
- AI Skills: GenAI (LLMs, RAG, LangChain, Braintrust), AutoML, semantic search, MLOps, AI agents

**CORE BACKGROUND (always relevant):**
Professional Experience:
- Currently: Data Product Manager at Axicorp (Jan 2024 - Present)
- Previously: Data Product Manager at Informatica (April 2021 - Dec 2023)
- Product Manager at Huawei (Jan 2018 - Feb 2021) - Generated $200M+ revenue
- Technology Architect at HPE (May 2013 - Dec 2017)

Cross-Domain Expertise:
- Product Strategy: 0-to-1 launches, cross-functional leadership, stakeholder alignment
- Technical Platforms: AWS, GCP, Azure, Databricks, BigQuery, Azure Stack
- Business Impact: Consistent 30-50% improvements in efficiency, cost reduction, revenue growth

**IMPORTANT - RESPONSE GUIDELINES:**

1. **OFF-TOPIC QUESTIONS:** If the user asks about topics NOT related to my professional background, respond with:
"I appreciate your question! However, I'm designed to discuss my professional background in data and AI product management. For other topics or detailed conversations, you can reach out to me directly:

📱 **Text/WhatsApp/Telegram**: +65 87913436
📧 **Email**: richardconstantine67@gmail.com
📅 **Schedule a 30-min chat**: https://calendly.com/richieriri/30min
💼 **LinkedIn**: https://www.linkedin.com/in/richieriri/

I'd be happy to connect and discuss further!"

2. **COMPLEX/DETAILED PROFESSIONAL QUESTIONS:** If the user asks very detailed, complex, or in-depth questions about my projects, technical implementations, or wants comprehensive discussions about my work, also redirect them to contact me directly:
"That's a great detailed question about my work! While I can provide a brief overview, for in-depth discussions about my projects and technical implementations, I'd recommend reaching out to me directly:

📱 **Text/WhatsApp/Telegram**: +65 87913436 (for quick questions)
📅 **Schedule a 30-min catch up**: https://calendly.com/richieriri/30min
📧 **Email**: richardconstantine67@gmail.com
💼 **LinkedIn**: https://www.linkedin.com/in/richieriri/

I'd love to have a more comprehensive conversation about this!"

3. **SIMPLE PROFESSIONAL QUESTIONS:** For basic questions about my role, experience, or general background, provide helpful but concise answers.

Always respond as Richard in first person. Be professional, knowledgeable, and helpful. Match your expertise depth to the user's question focus.`
      };

      // Prepare messages for OpenAI
      const messages = [
        systemMessage,
        ...conversation.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      console.log("🤖 Calling OpenAI with", messages.length, "messages");

      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
      
      console.log("✅ OpenAI response:", response.substring(0, 100) + "...");
      console.log("📊 Token usage:", completion.usage);

      // Add assistant message to conversation
      const now = Date.now();
      conversation.push({
        role: 'assistant',
        content: response,
        timestamp: now
      });

      // Save assistant message to database
      try {
        await ctx.runMutation(api.chat.mutations.saveMessage, {
          threadId: args.threadId,
          role: 'assistant',
          content: response,
          timestamp: now,
        });
      } catch (error) {
        console.error("❌ Failed to save assistant message:", error);
      }

      // Update thread lastMessageAt timestamp
      try {
        await ctx.runMutation(api.chat.mutations.updateThreadLastMessage, {
          threadId: args.threadId,
          lastMessageAt: now,
        });
        console.log("✅ Thread timestamp updated successfully");
      } catch (error) {
        console.error("❌ Failed to update thread timestamp:", error);
      }

      return {
        response,
        tokenUsage: completion.usage || null
      };

    } catch (error) {
      console.error("❌ Error in sendMessage:", error);
      
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
    
    // Create user-scoped conversation key
    const conversationKey = userId ? `${userId}:${args.threadId}` : `anon:${args.threadId}`;
    
    // First try to get from memory
    let conversation = conversations.get(conversationKey) || [];
    
    if (conversation.length === 0) {
      // If not in memory, try to load from database
      console.log("📚 Loading conversation from database for thread:", args.threadId);
      try {
        const dbMessages = await ctx.runQuery(api.chat.queries.getMessages, {
          threadId: args.threadId,
        });
        
        if (dbMessages && dbMessages.length > 0) {
          conversation = dbMessages;
          // Also populate the in-memory cache with user-scoped key
          conversations.set(conversationKey, conversation);
          console.log("✅ Loaded", dbMessages.length, "messages from database");
        }
      } catch (error) {
        console.error("❌ Failed to load messages from database:", error);
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
    console.log("🗑️ Deleting conversation for thread:", args.threadId);
    
    try {
      // Get current user for security
      const userId = await getAuthUserId(ctx);
      
      // Create user-scoped conversation key
      const conversationKey = userId ? `${userId}:${args.threadId}` : `anon:${args.threadId}`;
      
      // Remove from in-memory storage
      conversations.delete(conversationKey);
      
      // Remove from database
      await ctx.runMutation(api.chat.mutations.deleteThread, {
        threadId: args.threadId,
      });
      
      console.log("✅ Conversation deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Failed to delete conversation:", error);
      return { success: false, error: (error as Error).message };
    }
  },
});