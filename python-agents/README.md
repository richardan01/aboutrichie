OpenAI Agents SDK Tracing (Python)

Overview
- Uses the official OpenAI Agents SDK (Python) which has built‑in tracing to the OpenAI Traces dashboard.
- Tracing is ON by default; runs appear in https://platform.openai.com/traces for accounts without ZDR.
- This is ideal for collecting traces for evals and deeper analysis.

Install
1) Create a virtual environment
   - Windows (PowerShell):
     - py -m venv .venv
     - .venv\\Scripts\\Activate
   - macOS/Linux:
     - python3 -m venv .venv
     - source .venv/bin/activate

2) Install dependencies
   - pip install -r requirements.txt

Env Vars
- REQUIRED: `OPENAI_API_KEY`
- OPTIONAL: `OPENAI_AGENTS_DISABLE_TRACING=1` to disable tracing (default is enabled; do not set this for tracing).

Run a traced test
- Windows (PowerShell):
  - $env:OPENAI_API_KEY="sk-..."
  - Optional: $env:OPENAI_MODEL="gpt-4o-mini"
  - python trace_test.py --input "Say hi and include the word pong"

- macOS/Linux:
  - export OPENAI_API_KEY="sk-..."
  - Optional: export OPENAI_MODEL="gpt-4o-mini"
  - python3 trace_test.py --input "Say hi and include the word pong"

Notes
- Traces will appear grouped under workflow name "Agent workflow" by default.
- You can pass a `--group-id` (e.g., your chat threadId) to group multiple runs.
- We explicitly set the tracing export key and model in code; traces should appear at https://platform.openai.com/traces. The Logs page is separate.
- Traces may take a few seconds to appear; refresh the page after 5–15 seconds.
