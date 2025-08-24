# AI Storefront Setup Guide

## Environment Variables

After switching from XAI to OpenAI, you need these environment variables:

### Required
```bash
# OpenAI API Key (replaces XAI_API_KEY)
OPENAI_API_KEY=your_openai_api_key_here

# Cohere API Key for embeddings/RAG search
COHERE_API_KEY=your_cohere_api_key_here
```

### Optional
```bash
# WorkOS Client ID for authentication (anonymous chat works without it)
WORKOS_CLIENT_ID=client_your_workos_client_id_here
```

## Getting API Keys

1. **OpenAI API Key**: 
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Set it as `OPENAI_API_KEY`

2. **Cohere API Key**:
   - Go to https://dashboard.cohere.ai/api-keys
   - Create a new API key  
   - Set it as `COHERE_API_KEY`

## Models Used

- **Chat Agent**: `gpt-4o` (equivalent to previous `grok-3-mini`)
- **Evaluations**: `gpt-4o` (equivalent to previous `grok-4`)
- **Embeddings**: Cohere `embed-english-v3.0` (unchanged)

## One-time Setup

After setting environment variables, seed your background data:

```bash
# Start Convex development
npx convex dev

# In another terminal, seed your CV and career story (run once)
npx convex run internal.ai.actionsNode.addCVEmbeddings
npx convex run internal.ai.actionsNode.addDataProductManagerJourneyEmbeddings
```

## What Changed

- ✅ Replaced XAI/Grok models with OpenAI GPT models
- ✅ Updated all agents to use `gpt-4o-mini` for chat
- ✅ Updated evaluation tests to use `gpt-4o`
- ✅ Environment variable changed from `XAI_API_KEY` to `OPENAI_API_KEY`
- ✅ No changes needed to RAG/embeddings (still uses Cohere)

Your "Ask Richard" AI assistant is now powered by OpenAI! 🚀