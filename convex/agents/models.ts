import { openai } from "@ai-sdk/openai";

// OpenAI client configuration - uses OPENAI_API_KEY environment variable
export const gpt4o = openai("gpt-4o");

export const gpt4oMini = openai("gpt-4o-mini");

export const gpt35Turbo = openai("gpt-3.5-turbo");

// Default model for agents (equivalent to grok3Mini)
export const defaultModel = gpt4oMini;
