#!/bin/bash
# Test script to generate synthetic chat traces via proxy

echo "=========================================="
echo "Testing OpenAI Traces via Proxy"
echo "=========================================="
echo ""

# Test conversations
declare -a prompts=(
    "Hello, can you tell me about Richard's data product management experience?"
    "What AI projects has Richard worked on?"
    "Tell me about Richard's work at Axicorp"
    "What is Richard's experience with GenAI?"
    "Has Richard built any AI-driven platforms?"
)

declare -a thread_ids=(
    "test-thread-data-pm"
    "test-thread-ai-projects"
    "test-thread-axicorp"
    "test-thread-genai"
    "test-thread-platforms"
)

# Loop through and send requests
for i in "${!prompts[@]}"; do
    echo "[TEST $((i+1))/${#prompts[@]}] Thread: ${thread_ids[$i]}"
    echo "Prompt: ${prompts[$i]}"

    response=$(curl -s -X POST http://localhost:8765/run \
        -H "Content-Type: application/json" \
        -d "{\"prompt\": \"${prompts[$i]}\", \"group_id\": \"${thread_ids[$i]}\"}")

    echo "Response:"
    echo "$response" | python -m json.tool 2>/dev/null || echo "$response"
    echo ""
    echo "------------------------------------------"
    echo ""

    # Small delay between requests
    sleep 1
done

echo "=========================================="
echo "Synthetic trace generation complete!"
echo "View traces at: https://platform.openai.com/traces"
echo "=========================================="
