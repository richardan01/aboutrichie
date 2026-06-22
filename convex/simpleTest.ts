import "./tracing/otel"; // initialize Phoenix + OTEL once per worker
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { traceLLMCall } from "./tracing/simple";

export const simpleOpenAITest = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Testing AI SDK OpenAI call with prompt:", args.prompt);
      console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);
      
      // Try using prompt instead of messages format
      // Use native OpenAI SDK instead to avoid version compatibility issues
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      const completion = await client.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "user",
            content: args.prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 512,
      });
      
      const result = {
        text: completion.choices[0]?.message?.content || "",
        usage: completion.usage,
      };
      
      console.log("OpenAI response:", result.text);
      console.log("OpenAI usage:", result.usage);
      console.log("Response length:", result.text.length);
      return result.text;
    } catch (error) {
      console.error("Error in simpleOpenAITest:", error);
      throw error;
    }
  },
});

export const testOpenAI = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Testing OpenAI call with prompt:", args.prompt);
      console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);
      
      // Use native OpenAI SDK instead to avoid version compatibility issues
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      const completion = await client.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: `You are Richard Ng, a Senior Data Product Manager with over 12 years of experience building enterprise data and AI platforms. 

Professional Background:
- Currently: Senior Data Product Manager at Axicorp (Aug 2023 - Present)
- Previously: Data Product Manager at Informatica (Feb 2020 - Jul 2023)
- Also worked at: Huawei, HPE, and other tech companies

Expertise:
- Data and AI product strategy and development
- Enterprise software and cloud platforms
- Product management and analytics
- Data engineering and ML/AI technologies

Always respond as Richard in first person, sharing insights about your work experience, expertise, and achievements.`,
          },
          {
            role: "user",
            content: args.prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
      });

      const result = {
        text: completion.choices[0]?.message?.content || "",
        usage: completion.usage,
      };

      console.log("OpenAI response:", result.text.substring(0, 100) + "...");
      console.log("OpenAI usage:", result.usage);
      return result.text;
    } catch (error) {
      console.error("Error in testOpenAI:", error);
      throw error;
    }
  },
});

export const testNativeOpenAI = action({
  args: {
    prompt: v.string(),
    userId: v.optional(v.string()),
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return traceLLMCall(
      "openai.chat.completions.create",
      {
        model: "gpt-5-nano",
        provider: "openai",
        temperature: 0.7,
        prompt: args.prompt,
        userId: args.userId,
        threadId: args.threadId,
      },
      async (span) => {
        try {
          console.log("Testing native OpenAI SDK with prompt:", args.prompt);
          console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);

          // If OPENAI_TRACES_PROXY_URL is set, route to the Python Agents proxy to emit OpenAI Traces
          const proxyUrl = process.env.OPENAI_TRACES_PROXY_URL;
          if (proxyUrl) {
            try {
              span.setAttributes({ "routing.mode": "openai_traces_proxy" });
              const res = await fetch(proxyUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: args.prompt, group_id: args.threadId }),
              });
              if (!res.ok) {
                const body = await res.text().catch(() => "");
                console.warn(`Proxy error ${res.status}: ${body}`);
                throw new Error(`Proxy error ${res.status}`);
              }
              const data = (await res.json()) as { text: string; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } };
              const response = data.text ?? "";
              if (data.usage) {
                span.setAttributes({
                  'llm.usage.prompt_tokens': data.usage.prompt_tokens ?? 0,
                  'llm.usage.completion_tokens': data.usage.completion_tokens ?? 0,
                  'llm.usage.total_tokens': data.usage.total_tokens ?? ((data.usage.prompt_tokens ?? 0) + (data.usage.completion_tokens ?? 0)),
                });
              }
              span.setAttributes({ "response.length": response.length });
              return response;
            } catch (e) {
              console.warn('Proxy call failed, falling back to OpenAI SDK:', e);
              // fall through to native SDK path
            }
          }

          span.setAttributes({
            'operation.type': 'llm_call',
            'request.type': 'chat_completion',
          });
          
          const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
          });
          
          const systemPrompt = `You are Richard Ng, a Senior Data Product Manager with over 12 years of experience building enterprise data and AI platforms.

Professional Background:
- Currently: Senior Data Product Manager at Axicorp (Aug 2023 - Present)
- Previously: Data Product Manager at Informatica (Feb 2020 - Jul 2023)
- Also worked at: Huawei, HPE, and other tech companies

Expertise:
- Data and AI product strategy and development
- Enterprise software and cloud platforms
- Product management and analytics
- Data engineering and ML/AI technologies

Response Rules:
- Always respond as Richard in first person.
- Avoid generic introductions and filler.
- Answer the user's exact question directly in the first sentence.
- Include at least 2 concrete details (company, metric, project, timeline, or tool) when relevant.
- If the question is broad, provide specific examples from Axicorp/Informatica/Huawei/HPE.
- If context is missing, ask one targeted follow-up question instead of giving a generic answer.`;
          
          const completion = await client.chat.completions.create({
            model: "gpt-5-nano",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: args.prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 512,
          });
          
          const response = completion.choices[0]?.message?.content || "";
          
          // Update span with actual usage data
          if (completion.usage) {
            span.setAttributes({
              'llm.usage.prompt_tokens': completion.usage.prompt_tokens,
              'llm.usage.completion_tokens': completion.usage.completion_tokens,
              'llm.usage.total_tokens': completion.usage.total_tokens,
            });
          }
          
          span.setAttributes({
            'response.length': response.length,
            'response.finish_reason': completion.choices[0]?.finish_reason || 'unknown',
          });
          
          console.log("Native OpenAI response:", response.substring(0, 100) + "...");
          console.log("Native OpenAI usage:", completion.usage);
          return response;
        } catch (error) {
          console.error("Error in testNativeOpenAI:", error);
          throw error;
        }
      }
    );
  },
});

// Diagnostic-friendly variant: returns text + routing info
export const testOpenAIWithDiagnostics = action({
  args: {
    prompt: v.string(),
    userId: v.optional(v.string()),
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const proxyUrl = process.env.OPENAI_TRACES_PROXY_URL;
    if (proxyUrl) {
      try {
        const res = await fetch(proxyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: args.prompt, group_id: args.threadId }),
        });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          console.warn(`Proxy error ${res.status}: ${body}`);
          throw new Error(`Proxy error ${res.status}`);
        }
        const data = (await res.json()) as { text: string; trace_id?: string };
        return { text: data.text ?? "", viaProxy: true, traceId: data.trace_id ?? null, groupId: args.threadId ?? null } as const;
      } catch (e) {
        console.warn("Proxy call failed, falling back to OpenAI SDK:", e);
      }
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: "You are a concise assistant." },
        { role: "user", content: args.prompt },
      ],
      temperature: 0.7,
      max_tokens: 512,
    });
    const response = completion.choices[0]?.message?.content || "";
    return { text: response, viaProxy: false, traceId: null, groupId: args.threadId ?? null } as const;
  },
});

// Server-side diagnostics for proxy + env
export const telemetryDiagnostics = action({
  args: {},
  handler: async () => {
    const proxyUrl = process.env.OPENAI_TRACES_PROXY_URL || null;
    const hasServerOpenAIKey = !!process.env.OPENAI_API_KEY;
    const phoenixConfigured = !!process.env.PHOENIX_API_KEY && !!process.env.PHOENIX_COLLECTOR_ENDPOINT;

    let proxyReachable = false;
    let proxyHasOpenAIKey: boolean | null = null;
    let proxyHealthError: string | null = null;
    let proxyHealthUrl: string | null = null;
    if (proxyUrl) {
      try {
        const u = new URL(proxyUrl);
        proxyHealthUrl = `${u.origin}/health`;
        const res = await fetch(proxyHealthUrl);
        proxyReachable = res.ok;
        if (res.ok) {
          const data = (await res.json()) as { has_openai_key?: boolean };
          proxyHasOpenAIKey = !!data?.has_openai_key;
        } else {
          proxyHealthError = `HTTP ${res.status}`;
        }
      } catch (e: any) {
        proxyReachable = false;
        proxyHealthError = e?.message || String(e);
      }
    }

    return {
      proxyUrl,
      proxyHealthUrl,
      proxyReachable,
      proxyHasOpenAIKey,
      proxyHealthError,
      hasServerOpenAIKey,
      phoenixConfigured,
      environment: process.env.NODE_ENV || null,
      serviceName: process.env.OTEL_SERVICE_NAME || "ai-storefront",
    };
  },
});

// Generate multiple sample traces via the proxy (if configured) or fallback SDK
export const generateSampleTraces = action({
  args: {
    count: v.optional(v.number()),
    groupId: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const count = Math.max(1, Math.min(10, args.count ?? 3));
    const proxyUrl = process.env.OPENAI_TRACES_PROXY_URL || null;
    const groupId = args.groupId || `samples-${Date.now()}`;

    const results: Array<{ index: number; viaProxy: boolean; traceId: string | null; text: string }> = [];

    if (proxyUrl) {
      for (let i = 0; i < count; i++) {
        const prompt = `Sample trace ${i + 1}: reply with 'pong ${i + 1}'.`;
        try {
          const res = await fetch(proxyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, group_id: groupId }),
          });
          if (!res.ok) {
            const body = await res.text().catch(() => "");
            console.warn(`Proxy error ${res.status}: ${body}`);
            throw new Error(`Proxy error ${res.status}`);
          }
          const data = (await res.json()) as { text?: string; trace_id?: string };
          results.push({ index: i, viaProxy: true, traceId: data.trace_id ?? null, text: data.text ?? "" });
        } catch (e) {
          // On any error, break and fall back for remaining items
          console.warn("Proxy call failed during sample generation; switching to SDK fallback:", e);
          break;
        }
      }
      if (results.length === count) {
        return { groupId, results } as const;
      }
    }

    // Fallback to native SDK for remaining or all
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    for (let i = results.length; i < count; i++) {
      const prompt = `Sample trace ${i + 1}: reply with 'pong ${i + 1}'.`;
      const completion = await client.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          { role: "system", content: "You are a concise assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 512,
      });
      const text = completion.choices[0]?.message?.content || "";
      results.push({ index: i, viaProxy: false, traceId: null, text });
    }

    return { groupId, results } as const;
  },
});
