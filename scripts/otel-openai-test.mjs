// Minimal end-to-end test: initialize OTEL -> Phoenix and make an OpenAI call
// This is JS-only so it can run directly with Node (ESM).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OpenInferenceOpenAIInstrumentation } from '@arizeai/openinference-instrumentation-openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvDotFile(envPath) {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
    console.log(`Loaded env from ${envPath}`);
  } catch {
    // ignore missing file
  }
}

// Load .env.local from repo root if present
loadEnvDotFile(path.resolve(__dirname, '..', '.env.local'));

const endpoint = process.env.PHOENIX_COLLECTOR_ENDPOINT;
const apiKey = process.env.PHOENIX_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!endpoint || !apiKey) {
  console.log('PHOENIX env not found; spans will not be exported');
}
if (!openaiKey) {
  console.error('OPENAI_API_KEY missing. Aborting test.');
  process.exit(1);
}

const traceExporter = endpoint && apiKey
  ? new OTLPTraceExporter({
      url: endpoint,
      headers: {
        api_key: apiKey,
        authorization: `Bearer ${apiKey}`,
      },
    })
  : undefined;

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]:
    process.env.OTEL_SERVICE_NAME || 'ai-storefront',
  [SemanticResourceAttributes.SERVICE_VERSION]:
    process.env.OTEL_SERVICE_VERSION || '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
    process.env.NODE_ENV || 'development',
});

const sdk = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [
    new OpenInferenceOpenAIInstrumentation({ suppressInternalInstrumentation: true }),
  ],
});

console.log('Starting OTEL SDK...');
await sdk.start();
console.log('OTEL SDK started. Calling OpenAI...');

const client = new OpenAI({ apiKey: openaiKey });

const completion = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'You are a concise assistant.' },
    { role: 'user', content: 'Say hi in one short sentence.' },
  ],
  max_tokens: 20,
  temperature: 0.2,
});

console.log('OpenAI response:', completion.choices[0]?.message?.content || '(no content)');
console.log('Usage:', completion.usage);

// Give some time to flush the exporter then shutdown cleanly
await new Promise((r) => setTimeout(r, 500));
await sdk.shutdown().catch(() => {});
console.log('Done. Check Phoenix for incoming traces.');

