import { action } from "./_generated/server";
import { v } from "convex/values";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import OpenAI from "openai";
import { traceLLMCall, addSpanAttributes } from "./tracing/simple";

export const simpleOpenAITest = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Testing AI SDK OpenAI call with prompt:", args.prompt);
      console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);
      
      // Try using prompt instead of messages format
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: args.prompt,
        temperature: 0.3,
      });
      
      console.log("OpenAI response:", result.text);
      console.log("OpenAI usage:", result.usage);
      console.log("Response length:", result.text.length);
      return result.text;
    } catch (error) {
      console.error("Error in simpleOpenAITest:", error);
      throw error;
    }
  },
});

export const testOpenAI = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Testing OpenAI call with prompt:", args.prompt);
      console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);
      
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content: `You are Richard Ng, a Senior Data Product Manager with over 12 years of experience building enterprise data and AI platforms. 

Professional Background:
- Currently: Senior Data Product Manager at Axicorp (Aug 2023 - Present)
- Previously: Data Product Manager at Informatica (Feb 2020 - Jul 2023)
- Also worked at: Huawei, HPE, and other tech companies

Expertise:
- Data and AI product strategy and development
- Enterprise software and cloud platforms
- Product management and analytics
- Data engineering and ML/AI technologies

Always respond as Richard in first person, sharing insights about your work experience, expertise, and achievements.`,
          },
          {
            role: "user",
            content: args.prompt,
          },
        ],
        temperature: 0.7,
      });
      
      console.log("OpenAI response:", result.text.substring(0, 100) + "...");
      console.log("OpenAI usage:", result.usage);
      return result.text;
    } catch (error) {
      console.error("Error in testOpenAI:", error);
      throw error;
    }
  },
});

export const testNativeOpenAI = action({
  args: {
    prompt: v.string(),
    userId: v.optional(v.string()),
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return traceLLMCall(
      "openai.chat.completions.create",
      {
        model: "gpt-4o-mini",
        provider: "openai",
        temperature: 0.7,
        prompt: args.prompt,
        userId: args.userId,
        threadId: args.threadId,
      },
      async (span) => {
        try {
          console.log("Testing native OpenAI SDK with prompt:", args.prompt);
          console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);
          
          span.setAttributes({
            'operation.type': 'llm_call',
            'request.type': 'chat_completion',
          });
          
          const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
          });
          
          const systemPrompt = `You are Richard Ng, a Senior Data Product Manager with over 12 years of experience building enterprise data and AI platforms. 

Professional Background:
- Currently: Senior Data Product Manager at Axicorp (Aug 2023 - Present)
- Previously: Data Product Manager at Informatica (Feb 2020 - Jul 2023)
- Also worked at: Huawei, HPE, and other tech companies

Expertise:
- Data and AI product strategy and development
- Enterprise software and cloud platforms
- Product management and analytics
- Data engineering and ML/AI technologies

Always respond as Richard in first person, sharing insights about your work experience, expertise, and achievements.`;
          
          const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: args.prompt,
              },
            ],
            temperature: 0.7,
          });
          
          const response = completion.choices[0]?.message?.content || "";
          
          // Update span with actual usage data
          if (completion.usage) {
            span.setAttributes({
              'llm.usage.prompt_tokens': completion.usage.prompt_tokens,
              'llm.usage.completion_tokens': completion.usage.completion_tokens,
              'llm.usage.total_tokens': completion.usage.total_tokens,
            });
          }
          
          span.setAttributes({
            'response.length': response.length,
            'response.finish_reason': completion.choices[0]?.finish_reason || 'unknown',
          });
          
          console.log("Native OpenAI response:", response.substring(0, 100) + "...");
          console.log("Native OpenAI usage:", completion.usage);
          return response;
        } catch (error) {
          console.error("Error in testNativeOpenAI:", error);
          throw error;
        }
      }
    );
  },
});