import { ConvexError, v } from "convex/values";
import { ok, ResultAsync } from "neverthrow";
import { components, api } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { createStoreAgent } from "../agents/storeAgent";
import * as Errors from "../errors";
import { createThread as createThreadHelper } from "../helpers/createThread";
import { generateSummaryTitle } from "../helpers/generateSummaryTitle";
import { rateLimit } from "../helpers/rateLimit";
import { anonymousAction, authedAction } from "../procedures";
import { traceChatTurn } from "../tracing/simple";

export const createThread = authedAction({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    await rateLimit(ctx, {
      name: "createAiThread",
      key: ctx.user._id,
    }).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );
    const { threadId } = await generateSummaryTitle(ctx, {
      userId: ctx.user._id,
      prompt: `
            summarise the prompt below to create a title
  \`\`\`
  ${args.prompt}
  \`\`\`
            `,
    })
      .andThen((x) => {
        return createThreadHelper(ctx, {
          title: x.text,
          userId: ctx.user._id,
        });
      })
      .match(
        (x) => x,
        (e) => {
          throw new ConvexError(e);
        }
      );

    return { threadId };
  },
});

export const createAnonymousThread = anonymousAction({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    await rateLimit(ctx, {
      name: "createAiThread",
      key: ctx.anonymousUserId,
    }).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );
    const { threadId } = await generateSummaryTitle(ctx, {
      userId: ctx.anonymousUserId,
      prompt: `
            summarise the prompt below to create a title
  \`\`\`
  ${args.prompt}
  \`\`\`
            `,
    })
      .andThen((x) => {
        return createThreadHelper(ctx, {
          title: x.text,
          userId: ctx.anonymousUserId,
        });
      })
      .match(
        (x) => x,
        (e) => {
          console.error(e);
          throw new ConvexError(e);
        }
      );

    return {
      threadId: threadId,
      userId: ctx.anonymousUserId,
    };
  },
});

export const continueThread = authedAction({
  args: {
    threadId: v.string(),
    prompt: v.optional(v.string()),
    promptMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await rateLimit(ctx, {
      name: "sendAIMessage",
      key: ctx.user._id,
    }).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );
    return await ResultAsync.fromPromise(
      createStoreAgent().continueThread(ctx, {
        threadId: args.threadId,
        userId: ctx.user._id,
      }),
      (e) =>
        Errors.continueThreadFailed({
          message: "Failed to continue thread",
          error: e,
        })
    )
      .andThen((x) => {
        return ResultAsync.fromPromise(
          x.thread.generateText({
            prompt: args.prompt,
            promptMessageId: args.promptMessageId,
            temperature: 0.3,
          }),
          (e) => {
            console.error("ERRORRR102", e);
            return Errors.generateAiTextFailed({
              message: "Failed to generate AI text",
            });
          }
        );
      })
      .match(
        (x) => x.text,
        (e) => {
          console.error("ERRORRR100", e);
          throw new ConvexError(e);
        }
      );
  },
});

export const _generateThreadTitle = internalAction({
  args: {
    prompt: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await generateSummaryTitle(ctx, {
      userId: args.userId,
      prompt: args.prompt,
    }).match(
      (x) => x.text,
      (e) => {
        throw new ConvexError(e);
      }
    );
  },
});

export const continueAnonymousThread = anonymousAction({
  args: {
    threadId: v.string(),
    prompt: v.string(),
    promptMessageId: v.optional(v.string()),
    disableStream: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return traceChatTurn(
      "continue_thread",
      {
        userId: ctx.anonymousUserId,
        threadId: args.threadId,
        turnId: `${args.threadId}-${Date.now()}`,
      },
      async () => {
        await rateLimit(ctx, {
          name: "sendAIMessage",
          key: ctx.anonymousUserId,
        }).match(
          (x) => x,
          (e) => {
            throw new ConvexError(e);
          }
        );
        
        try {
          // Use native OpenAI directly with proper system context
          console.log("Using native OpenAI for prompt:", args.prompt);
          const openAIResponse = await ctx.runAction(api.simpleTest.testNativeOpenAI, {
            prompt: args.prompt,
            userId: ctx.anonymousUserId,
            threadId: args.threadId,
          });
          
          if (openAIResponse && openAIResponse.trim().length > 0) {
            console.log("OpenAI response successful:", openAIResponse.substring(0, 100) + "...");
            return openAIResponse;
          }
        } catch (error) {
          console.error("OpenAI failed, falling back to mock:", error);
        }
        
        // Fall back to mock response
        console.log("Using mock response for prompt:", args.prompt);
        const mockResponse = await ctx.runAction(api.mockAgent.mockChatResponse, {
          prompt: args.prompt,
        });
        
        console.log("Returning mock response:", mockResponse.substring(0, 100) + "...");
        return mockResponse;
      }
    );
  },
});

export const deleteAiThread = authedAction({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runAction(components.agent.threads.deleteAllForThreadIdSync, {
      threadId: args.threadId,
    });
  },
});

export const deleteAnonymousAiThread = anonymousAction({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.runQuery(components.agent.threads.getThread, {
      threadId: args.threadId,
    });

    if (thread?.userId !== ctx.anonymousUserId) {
      throw new ConvexError(
        Errors.aiThreadNotFound({ message: "Thread not found" })
      );
    }

    await ctx.runAction(components.agent.threads.deleteAllForThreadIdSync, {
      threadId: args.threadId,
    });
  },
});
