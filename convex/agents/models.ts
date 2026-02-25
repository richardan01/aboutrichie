import { openai } from "@ai-sdk/openai";

// OpenAI client configuration - uses OPENAI_API_KEY environment variable
export const gpt4o = openai("gpt-4o");

export const gpt5Nano = openai("gpt-5-nano");

export const gpt35Turbo = openai("gpt-3.5-turbo");

// Default model for agents (equivalent to grok3Mini)
export const defaultModel = gpt5Nano;
