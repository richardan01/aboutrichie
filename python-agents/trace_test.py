import os
import asyncio
import argparse

from agents import Agent, Runner, trace, set_tracing_export_api_key  # type: ignore


async def main():
    parser = argparse.ArgumentParser(description="Run a traced Agents SDK prompt")
    parser.add_argument("--input", required=True, help="User input prompt")
    parser.add_argument("--group-id", default=None, help="Optional group id to group traces (e.g., chat threadId)")
    args = parser.parse_args()

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required")

    # Always set export key so traces appear in https://platform.openai.com/traces
    set_tracing_export_api_key(api_key)

    # Define a minimal agent (uses default model unless configured elsewhere)
    model_name = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    agent = Agent(
        name="Assistant",
        instructions=(
            "You are a concise assistant. Reply in one short sentence unless asked for more."
        ),
        model_config={
            "model": model_name,
        },
    )

    runner = Runner()

    # Optional: Wrap multiple runs in a single high‑level trace and pass a group id
    async with trace(workflow_name="Agent workflow", group_id=args.group_id) as t:
        # Single run traced by default (SDK wraps run in a trace + spans)
        result = await runner.run(agent=agent, input=args.input)
        print("Result:\n", result.output_text)
        trace_id = getattr(t, "trace_id", None)
        if trace_id:
            print("Trace ID:", trace_id)


if __name__ == "__main__":
    asyncio.run(main())
