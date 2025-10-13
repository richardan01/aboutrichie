"""
Test script to generate synthetic chat data and verify OpenAI tracing.
Run with: python test_traces.py
"""
import os
import asyncio
import sys

# Check if agents module is available
try:
    from agents import Agent, Runner, trace, set_tracing_export_api_key
except ImportError:
    print("ERROR: 'agents' module not found.")
    print("Please install with: pip install openai-agents")
    print(f"Current Python: {sys.version}")
    print(f"Python executable: {sys.executable}")
    sys.exit(1)


async def generate_synthetic_traces():
    """Generate synthetic chat conversations with tracing enabled."""

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY environment variable not set")
        return

    # Configure tracing export
    set_tracing_export_api_key(api_key)
    print("[OK] Tracing export key configured")
    print(f"[INFO] Traces will be visible at: https://platform.openai.com/traces\n")

    # Define agent with proper instructions
    model_name = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    agent = Agent(
        name="Richard AI Assistant",
        instructions=(
            "You are Richard Ng, a Data Product Manager and AI Product Manager. "
            "Respond concisely about your professional background in data and AI."
        ),
        model=model_name,
    )

    runner = Runner()

    # Test conversations to generate traces
    test_prompts = [
        {
            "input": "Hello, can you tell me about your data product management experience?",
            "thread_id": "test-thread-data-pm",
        },
        {
            "input": "What AI projects have you worked on?",
            "thread_id": "test-thread-ai-projects",
        },
        {
            "input": "Tell me about your work at Axicorp",
            "thread_id": "test-thread-axicorp",
        },
    ]

    print("[START] Synthetic trace generation...\n")

    for i, prompt_data in enumerate(test_prompts, 1):
        print(f"[TEST] {i}/{len(test_prompts)}")
        print(f"   Thread ID: {prompt_data['thread_id']}")
        print(f"   Prompt: {prompt_data['input'][:60]}...")

        try:
            # Wrap in trace context with group_id for thread grouping - must use async with
            async with trace(workflow_name="Chat Conversation", group_id=prompt_data['thread_id']) as t:
                result = await runner.run(agent=agent, input=prompt_data['input'])

                trace_id = getattr(t, "trace_id", None)
                response_text = result.output_text or "No response"

                print(f"   [OK] Response: {response_text[:80]}...")
                if trace_id:
                    print(f"   [TRACE] Trace ID: {trace_id}")
                    print(f"   [LINK] View: https://platform.openai.com/traces/{trace_id}")
                print()

        except Exception as e:
            import traceback
            print(f"   [ERROR] {e}")
            traceback.print_exc()
            print()

    print("=" * 60)
    print("[DONE] Synthetic trace generation complete!")
    print(f"[LINK] View all traces at: https://platform.openai.com/traces")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(generate_synthetic_traces())
