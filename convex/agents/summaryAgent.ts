import { Agent } from "@convex-dev/agent";
import type { LanguageModelV1Middleware } from "ai";
import { wrapLanguageModel } from "ai";
import { components } from "../_generated/api";
import { defaultModel } from "./models";

export const createSummaryAgent = (
  args: {
    middleware?: LanguageModelV1Middleware | LanguageModelV1Middleware[];
    modelId?: string;
    providerId?: string;
  } = {}
) => {
  const { middleware = [], modelId, providerId } = args;
  type WrappedModel = Parameters<typeof wrapLanguageModel>[0]["model"];

  return new Agent(components.agent, {
    chat: wrapLanguageModel({
      model: defaultModel as unknown as WrappedModel,
      middleware,
      modelId,
      providerId,
    }),
    name: "Summary agent",
    instructions: `You are an AI summary agent that summarises any given text by the user in 15 words or less in order to create a title for an AI conversation. Your sole purpose in life is to summarise and provide titles for AI conversations in a direct and easy to understand manner. These titles should be NO LONGER than 15 words and capture the essence of what the user is trying to say.
    `,
  });
};
