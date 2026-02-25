# AI Storefront

AI-powered portfolio chat app built with React Router v7 and Convex. It supports anonymous and authenticated chat threads, RAG-backed responses, and optional telemetry/testing integrations.

## Stack
- React Router v7 + React 18 + TypeScript
- Convex (functions, storage, auth wiring)
- WorkOS AuthKit
- Vite + pnpm
- OpenAI/XAI/Cohere SDKs (provider support depends on env + code path)

## Prerequisites
- Node.js 22+
- pnpm
- Convex account
- WorkOS account (if using auth)
- Model API key (OpenAI required for current default flows)

## Quick Start (Known Good Local Setup)
1. Install dependencies:
```bash
pnpm install
```
2. Copy environment template:
```bash
cp .env.example .env.local
```
3. Fill required values in `.env.local`.
4. Start Convex dev backend:
```bash
pnpm convex:dev
```
5. In another terminal, start app:
```bash
pnpm dev
```
6. Open `http://localhost:5173`.

## Environment Variables
Use `.env.example` as the source of truth. Common required values:
- `VITE_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `VITE_WORKOS_CLIENT_ID` and `WORKOS_CLIENT_ID` (if auth enabled)
- `OPENAI_API_KEY`

Optional:
- `WORKOS_API_KEY`, `WORKOS_WEBHOOK_SECRET`
- `RESEND_API_KEY`, `RESEND_AUDIENCE_LIST_ID`
- `OPENAI_TRACES_PROXY_URL`
- `PHOENIX_API_KEY`, `PHOENIX_COLLECTOR_ENDPOINT`
- `OTEL_SERVICE_NAME`, `OTEL_SERVICE_VERSION`, `OTEL_ENABLE_CONSOLE`

## Scripts
```bash
pnpm dev            # app dev server
pnpm convex:dev     # convex dev backend
pnpm build          # production build
pnpm start          # serve built app
pnpm lint           # oxlint
pnpm typecheck      # react-router typegen + tsc
pnpm test           # vitest
```

## Notes
- Keep real secrets only in local/deployment env, never in repo.
- If any key was accidentally exposed, rotate it immediately.
