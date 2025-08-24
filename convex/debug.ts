import { action } from "./_generated/server";
import { createStoreAgent } from "./agents/storeAgent";
import { v } from "convex/values";

export const testAgent = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Testing agent with prompt:", args.prompt);
      
      const agent = createStoreAgent();
      console.log("Agent created successfully");
      
      // Create a thread first
      const createResult = await agent.createThread(ctx, {
        userId: "test-user-id"
      });
      console.log("Thread created:", createResult.threadId);
      
      // Continue the thread to get the thread object
      const { thread } = await agent.continueThread(ctx, {
        threadId: createResult.threadId,
        userId: "test-user-id"
      });
      console.log("Thread continued successfully");
      
      // Generate text using the thread
      const response = await thread.generateText({
        prompt: args.prompt,
        temperature: 0.3,
      });
      
      console.log("Agent response - text:", response.text);
      console.log("Agent response - usage:", response.usage);
      console.log("Agent response - finishReason:", response.finishReason);
      return response.text || "No response generated";
    } catch (error) {
      console.error("Error in testAgent:", error);
      throw error;
    }
  },
});