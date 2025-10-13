# Project Structure

This is Richard Ng's AI-powered personal website and portfolio built with React Router, Convex, and OpenAI.

## Overview

A modern web application featuring:
- AI-powered chat assistant with tracing support
- Resume-driven conversational AI
- Telemetry and observability with Phoenix/OpenTelemetry
- Serverless backend with Convex
- React Router for frontend

## Directory Structure

```
ai-storefront/
├── app/                    # Frontend React Router application
│   ├── routes/            # Route definitions
│   ├── components/        # Reusable React components
│   └── lib/              # Frontend utilities
│
├── convex/                # Backend Convex functions
│   ├── chat/             # Chat functionality
│   │   ├── actions.ts    # Main chat actions
│   │   ├── queries.ts    # Chat queries
│   │   └── mutations.ts  # Chat mutations
│   ├── data/             # Structured data
│   │   ├── resumeData.ts # Resume information
│   │   └── README.md     # Data module docs
│   ├── helpers/          # Utility functions
│   │   └── systemPrompt.ts # AI prompt generation
│   ├── tracing/          # Telemetry & tracing
│   │   ├── otel.ts       # OpenTelemetry setup
│   │   └── simple.ts     # Simple tracing utils
│   ├── agents/           # AI agent implementations
│   ├── ai/               # AI-related functions
│   └── schema.ts         # Database schema
│
├── python-agents/         # Python-based OpenAI Agents SDK
│   ├── server.py         # FastAPI proxy server
│   ├── trace_test.py     # Testing script
│   └── requirements.txt  # Python dependencies
│
├── public/               # Static assets
│   └── *.pdf            # Resume files
│
├── emails/              # Email templates
└── scripts/             # Build and deployment scripts
```

## Key Technologies

### Frontend
- **React Router 7** - Modern React framework with file-based routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **Motion** - Animation library
- **Radix UI** - Accessible component primitives

### Backend
- **Convex** - Serverless backend platform
- **OpenAI Agents SDK** - AI agent orchestration with built-in tracing
- **OpenTelemetry** - Observability and tracing
- **Phoenix** - AI observability platform

### AI & Data
- **OpenAI GPT-4o-mini** - Language model
- **Structured Resume Data** - TypeScript-based resume information
- **Dynamic Prompt Generation** - Context-aware AI responses

## Core Features

### 1. AI Chat Assistant
- **Location**: `convex/chat/actions.ts`
- Uses OpenAI Agents SDK with automatic tracing
- Conversational context management
- Usage tracking and analytics

### 2. Resume Data Module
- **Location**: `convex/data/`
- Structured TypeScript data for professional information
- Dynamic system prompt generation
- Single source of truth for all resume data

### 3. Telemetry & Observability
- **Location**: `convex/tracing/`
- OpenTelemetry integration
- Phoenix platform for AI trace visualization
- Token usage tracking

### 4. Python Agents Proxy
- **Location**: `python-agents/`
- FastAPI server for OpenAI Agents SDK
- Native OpenAI Traces integration
- Deployed separately for tracing capabilities

## Configuration Files

- `convex.json` - Convex configuration
- `tsconfig.json` - TypeScript configuration
- `biome.json` - Code formatting configuration
- `react-router.config.ts` - React Router configuration
- `vite.config.ts` - Vite build configuration
- `vercel.json` - Vercel deployment configuration

## Environment Variables

Required:
- `OPENAI_API_KEY` - OpenAI API key
- `CONVEX_DEPLOYMENT` - Convex deployment URL
- `CONVEX_URL` - Convex backend URL

Optional:
- `PHOENIX_API_KEY` - Phoenix observability platform
- `PHOENIX_COLLECTOR_ENDPOINT` - Phoenix endpoint
- `OPENAI_TRACES_PROXY_URL` - Python agents proxy URL
- `OTEL_SERVICE_NAME` - Service name for telemetry

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run Convex backend locally
pnpm convex:dev

# Type check
pnpm typecheck

# Format code
pnpm format

# Lint code
pnpm lint
```

## Deployment

### Convex
```bash
pnpm convex:deploy
```

### Frontend (Vercel)
Automatic deployment on push to main branch

### Python Agents Proxy
See `python-agents/DEPLOYMENT_GUIDE.md`

## Best Practices

1. **Resume Updates**: Modify `convex/data/resumeData.ts` - changes auto-reflect in AI
2. **AI Prompts**: Use `generateSystemInstructions()` for consistency
3. **Type Safety**: All Convex functions use TypeScript validation
4. **Tracing**: OpenAI Agents SDK handles tracing automatically
5. **Error Handling**: All actions have try-catch with fallback responses

## Testing

```bash
# Run tests
pnpm test

# Test telemetry
# Navigate to /telemetry-test route in the app
```

## Documentation

- `convex/data/README.md` - Resume data module documentation
- `python-agents/README.md` - Python agents setup
- `python-agents/DEPLOYMENT_GUIDE.md` - Deployment instructions
- `README.md` - Main project README

## Support

Contact: richardconstantine67@gmail.com
Website: https://developerdanwu.com
