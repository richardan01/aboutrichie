import { openai } from "@ai-sdk/openai";
import { RAG } from "@convex-dev/rag";
import { components } from "./_generated/api";

type FilterTypes = {};

export const rag = new RAG<FilterTypes>(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-ada-002"),
  embeddingDimension: 1536,
});
