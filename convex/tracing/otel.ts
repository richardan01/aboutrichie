"use node";

// Manual Phoenix (Arize) tracing - HTTP-based without OpenTelemetry SDK
// Sends traces directly to Phoenix HTTP endpoint in OpenTelemetry format

type SpanKind = "INTERNAL" | "SERVER" | "CLIENT" | "PRODUCER" | "CONSUMER";
type SpanStatusCode = "UNSET" | "OK" | "ERROR";

interface SpanAttributes {
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
}

interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: SpanAttributes;
}

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: SpanKind;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes: SpanAttributes;
  events?: SpanEvent[];
  status: {
    code: SpanStatusCode;
    message?: string;
  };
}

interface TraceData {
  resourceSpans: Array<{
    resource: {
      attributes: Array<{
        key: string;
        value: { stringValue?: string; intValue?: number; boolValue?: boolean };
      }>;
    };
    scopeSpans: Array<{
      scope: {
        name: string;
        version: string;
      };
      spans: Span[];
    }>;
  }>;
}

// Helper to generate random IDs
function generateTraceId(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function generateSpanId(): string {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function nowNano(): string {
  return (Date.now() * 1_000_000).toString();
}

// Send trace to Phoenix
async function sendTraceToPhoenix(traceData: TraceData): Promise<void> {
  const endpoint = process.env.PHOENIX_COLLECTOR_ENDPOINT;
  const apiKey = process.env.PHOENIX_API_KEY;

  console.log("🔍 Phoenix tracing attempt:", {
    hasEndpoint: !!endpoint,
    hasApiKey: !!apiKey,
    endpoint: endpoint,
  });

  if (!endpoint || !apiKey) {
    console.warn("⚠️ Phoenix tracing skipped - missing endpoint or API key");
    return; // Silently skip if not configured
  }

  try {
    console.log("📤 Sending trace to Phoenix...", {
      endpoint,
      spanCount: traceData.resourceSpans[0]?.scopeSpans[0]?.spans.length,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": apiKey,
        "authorization": `Bearer ${apiKey}`,
        "x-phoenix-project-id": "UHJvamVjdDox", // Your project ID
      },
      body: JSON.stringify(traceData),
    });

    console.log("📥 Phoenix response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(
        `❌ Phoenix trace export failed: ${response.status} ${response.statusText}`,
        responseText
      );
    } else {
      console.log("✅ Trace successfully sent to Phoenix");
    }
  } catch (error) {
    console.error("❌ Failed to send trace to Phoenix:", error);
  }
}

// Main export: trace an OpenAI completion
export async function traceOpenAICompletion(
  model: string,
  messages: Array<{ role: string; content: string }>,
  response: { content: string; usage?: any },
  metadata?: { threadId?: string; userId?: string }
): Promise<void> {
  console.log("🚀 traceOpenAICompletion called", {
    model,
    messageCount: messages.length,
    hasUsage: !!response.usage,
    metadata,
  });

  const traceId = generateTraceId();
  const spanId = generateSpanId();
  const startTime = nowNano();

  // Simulate some processing time
  await new Promise(resolve => setTimeout(resolve, 0));

  const endTime = nowNano();

  const span: Span = {
    traceId,
    spanId,
    name: `openai.chat.completions.create`,
    kind: "CLIENT",
    startTimeUnixNano: startTime,
    endTimeUnixNano: endTime,
    attributes: {
      "llm.system": "openai",
      "llm.request.model": model,
      "llm.request.type": "chat",
      "llm.input.messages": JSON.stringify(messages),
      "llm.output.messages": JSON.stringify([
        { role: "assistant", content: response.content },
      ]),
      ...(response.usage && {
        "llm.usage.prompt_tokens": response.usage.prompt_tokens || 0,
        "llm.usage.completion_tokens": response.usage.completion_tokens || 0,
        "llm.usage.total_tokens": response.usage.total_tokens || 0,
      }),
      ...(metadata?.threadId && { "session.id": metadata.threadId }),
      ...(metadata?.userId && { "user.id": metadata.userId }),
    },
    status: {
      code: "OK",
    },
  };

  const traceData: TraceData = {
    resourceSpans: [
      {
        resource: {
          attributes: [
            {
              key: "service.name",
              value: { stringValue: process.env.OTEL_SERVICE_NAME || "ai-storefront" },
            },
            {
              key: "service.version",
              value: { stringValue: process.env.OTEL_SERVICE_VERSION || "1.0.0" },
            },
            {
              key: "deployment.environment",
              value: { stringValue: process.env.NODE_ENV || "development" },
            },
            {
              key: "phoenix.project.id",
              value: { stringValue: "UHJvamVjdDox" },
            },
          ],
        },
        scopeSpans: [
          {
            scope: {
              name: "manual-phoenix-tracer",
              version: "1.0.0",
            },
            spans: [span],
          },
        ],
      },
    ],
  };

  await sendTraceToPhoenix(traceData);
}

