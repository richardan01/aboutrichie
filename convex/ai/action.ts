import "../tracing/otel"; // initialize Phoenix + OTEL once per worker
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

const MAX_PROMPT_LENGTH = 2000;
const MAX_OUTPUT_TOKENS = 512;

function validatePromptLength(prompt: string | undefined) {
  if (prompt && prompt.length > MAX_PROMPT_LENGTH) {
    throw new ConvexError(
      Errors.promptTooLong({
        message: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`,
        maxLength: MAX_PROMPT_LENGTH,
      })
    );
  }
}

/**
 * Creates a new chat thread for an authenticated user.
 * This action first generates a summary title for the thread based on the initial prompt,
 * then creates the thread and returns its ID.
 * @param prompt - The initial prompt from the user to start the thread.
 * @returns An object containing the ID of the newly created thread.
 */
export const createThread = authedAction({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    validatePromptLength(args.prompt);
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

/**
 * Creates a new chat thread for an anonymous user.
 * Similar to createThread, but for users who are not logged in.
 * It generates a title, creates the thread, and returns the thread ID and anonymous user ID.
 * @param prompt - The initial prompt from the user.
 * @returns An object containing the new thread's ID and the anonymous user's ID.
 */
export const createAnonymousThread = anonymousAction({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    validatePromptLength(args.prompt);
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

/**
 * Continues an existing chat thread for an authenticated user.
 * It uses the store agent to generate a response to the user's prompt.
 * @param threadId - The ID of the thread to continue.
 * @param prompt - The user's new prompt.
 * @param promptMessageId - The optional ID of the prompt message.
 * @returns The generated text response from the AI.
 */
export const continueThread = authedAction({
  args: {
    threadId: v.string(),
    prompt: v.optional(v.string()),
    promptMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    validatePromptLength(args.prompt);
    await rateLimit(ctx, {
      name: "sendAIMessage",
      key: ctx.user._id,
    }).match(
      (x) => x,
      (e) => {
        throw new ConvexError(e);
      }
    );
    await rateLimit(ctx, {
      name: "sendAIMessageDaily",
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
            maxTokens: MAX_OUTPUT_TOKENS,
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

/**
 * Internal action to generate a summary title for a chat thread.
 * This is used by createThread and createAnonymousThread.
 * @param prompt - The user's prompt to summarize into a title.
 * @param userId - The ID of the user who owns the thread.
 * @returns The generated title as a string.
 */
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

/**
 * Continues an existing chat thread for an anonymous user.
 * This action sends the prompt to the AI and returns the generated response.
 * It includes a fallback to a mock response if the primary AI service fails.
 * @param threadId - The ID of the thread to continue.
 * @param prompt - The user's new prompt.
 * @param promptMessageId - The optional ID of the prompt message.
 * @param disableStream - Optional flag to disable streaming responses.
 * @returns The generated text response from the AI.
 */
export const continueAnonymousThread = anonymousAction({
  args: {
    threadId: v.string(),
    prompt: v.string(),
    promptMessageId: v.optional(v.string()),
    disableStream: v.optional(v.boolean()),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    return traceChatTurn(
      "continue_thread",
      {
        userId: ctx.anonymousUserId,
        threadId: args.threadId,
        turnId: `${args.threadId}-${Date.now()}`,
      },
      async () => {
        validatePromptLength(args.prompt);
        await rateLimit(ctx, {
          name: "sendAIMessage",
          key: ctx.anonymousUserId,
        }).match(
          (x) => x,
          (e) => {
            throw new ConvexError(e);
          }
        );
        await rateLimit(ctx, {
          name: "sendAIMessageDaily",
          key: ctx.anonymousUserId,
        }).match(
          (x) => x,
          (e) => {
            throw new ConvexError(e);
          }
        );

        try {
          // Primary path: use the thread-aware store agent so anonymous chats
          // keep conversational context and tool grounding across turns.
          const x = await createStoreAgent().continueThread(ctx, {
            threadId: args.threadId,
            userId: ctx.anonymousUserId,
          });
          const agentResponse = await x.thread.generateText({
            prompt: args.prompt,
            promptMessageId: args.promptMessageId,
            temperature: 0.3,
            maxTokens: MAX_OUTPUT_TOKENS,
          });
          if (agentResponse?.text?.trim().length) {
            return agentResponse.text;
          }
        } catch (error) {
          console.error("Thread-aware agent failed, falling back to native OpenAI:", error);
        }

        try {
          // Secondary path: use native OpenAI with thread ID for tracing continuity.
          console.log("Using native OpenAI fallback for prompt:", args.prompt);
          const openAIResponse: string = await ctx.runAction(api.simpleTest.testNativeOpenAI, {
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
        const mockResponse: string = await ctx.runAction(api.mockAgent.mockChatResponse, {
          prompt: args.prompt,
        });
        
        console.log("Returning mock response:", mockResponse.substring(0, 100) + "...");
        return mockResponse;
      }
    );
  },
});

/**
 * Deletes all data associated with a chat thread for an authenticated user.
 * @param threadId - The ID of the thread to be deleted.
 */
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

/**
 * Deletes all data associated with a chat thread for an anonymous user.
 * It includes a check to ensure the anonymous user owns the thread before deletion.
 * @param threadId - The ID of the thread to be deleted.
 */
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
