import os
import asyncio
from typing import Optional, Dict, Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from agents import Agent, Runner, trace, set_tracing_export_api_key  # type: ignore

app = FastAPI(title="OpenAI Traces Proxy")

# Ensure traces are exported to OpenAI Traces dashboard even if non‑OpenAI models are used
_api_key = os.environ.get("OPENAI_API_KEY")
if _api_key:
    try:
        set_tracing_export_api_key(_api_key)
        print("[proxy] Tracing export key configured for OpenAI Traces")
    except Exception as e:
        print("[proxy] Failed to set tracing export key:", e)


class RunRequest(BaseModel):
    prompt: str
    group_id: Optional[str] = None


class Usage(BaseModel):
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None


class RunResponse(BaseModel):
    text: str
    usage: Optional[Usage] = None
    trace_id: Optional[str] = None
    group_id: Optional[str] = None


@app.post("/run", response_model=RunResponse)
async def run(req: RunRequest) -> RunResponse:
    if not os.environ.get("OPENAI_API_KEY"):
        raise HTTPException(status_code=400, detail="OPENAI_API_KEY not set on proxy server")

    # Explicitly configure model to ensure the Agents SDK uses OpenAI
    model_name = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    agent = Agent(
        name="Assistant",
        instructions=(
            "You are a concise assistant. Reply in one short sentence unless asked for more."
        ),
        model=model_name,
    )
    runner = Runner()

    # Tracing is enabled by default in openai-agents SDK
    # According to docs: runner.run() automatically creates traces
    result = await runner.run(starting_agent=agent, input=req.prompt)

    # Note: trace_id is not directly exposed in v0.3.3 public API
    # Traces will still appear in OpenAI dashboard at https://platform.openai.com/traces
    output_text = result.final_output_as(str)
    print(f"[proxy] Agent run completed (group_id={req.group_id}, output_length={len(output_text)})")
    return RunResponse(text=output_text, usage=None, trace_id=None, group_id=req.group_id)


# For local dev: uvicorn server:app --reload --port 8765

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "has_openai_key": bool(os.environ.get("OPENAI_API_KEY")),
    }
