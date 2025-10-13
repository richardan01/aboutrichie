import * as React from "react";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConvexAction } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { Link } from "react-router";

export default function TelemetryTest() {
  const [prompt, setPrompt] = useState("Telemetry test: please reply with 'pong'.");
  const [response, setResponse] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [samples, setSamples] = useState<Array<{ index: number; viaProxy: boolean; traceId: string | null; text: string }>>([]);

  const runTest = useMutation({
    mutationKey: ["telemetry-openai-test"],
    mutationFn: useConvexAction(api.simpleTest.testOpenAIWithDiagnostics),
    onSuccess: (res: { text: string; viaProxy?: boolean; traceId?: string | null; groupId?: string | null }) => {
      setResponse(res?.text ?? "");
      setTraceId(res?.traceId ?? null);
      setGroupId(res?.groupId ?? null);
      const routeLabel = res?.viaProxy ? "proxy" : "fallback";
      const traceNote = res?.traceId ? ` traceId=${res.traceId}` : "";
      toast.success(`OpenAI call succeeded via ${routeLabel}.${traceNote ? " " + traceNote : ""} Check OpenAI Traces/Phoenix.`);
    },
    onError: (err: unknown) => {
      console.error("Telemetry test failed:", err);
      let details = "";
      if (err instanceof Error) {
        details = err.message || String(err);
      } else if (typeof err === "string") {
        details = err;
      } else {
        try {
          details = JSON.stringify(err);
        } catch {
          details = String(err);
        }
      }
      // Keep toast concise; show first 160 chars
      const preview = details.length > 160 ? details.slice(0, 160) + "…" : details;
      toast.error(`OpenAI call failed: ${preview}`);
    },
  });

  const runSamples = useMutation({
    mutationKey: ["telemetry-generate-samples"],
    mutationFn: useConvexAction(api.simpleTest.generateSampleTraces),
    onSuccess: (res: { groupId: string; results: Array<{ index: number; viaProxy: boolean; traceId: string | null; text: string }> }) => {
      setGroupId(res.groupId);
      setSamples(res.results);
      const viaProxyCount = res.results.filter(r => r.viaProxy).length;
      const note = viaProxyCount > 0 ? `via proxy (${viaProxyCount}/${res.results.length})` : "via fallback";
      toast.success(`Generated ${res.results.length} sample traces ${note}. Open Traces and search groupId.`);
    },
    onError: (err: unknown) => {
      console.error("Generate samples failed:", err);
      toast.error("Failed to generate sample traces. Check server logs.");
    },
  });

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Telemetry Test</h1>
        <Link to="/" className="text-sm underline">Back</Link>
      </div>

      <Diagnostics />

      <div className="p-4 space-y-3 rounded-md border border-border bg-background">
        <label className="text-sm font-medium">Prompt</label>
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a short prompt to test OpenAI"
        />
        <div className="flex gap-2">
          <Button
            onClick={() =>
              runTest.mutate({
                prompt,
                threadId: `ui-${Date.now()}`,
              })
            }
            loading={runTest.isPending}
          >
            {runTest.isPending ? "Running..." : "Run Telemetry Test"}
          </Button>
        </div>
      </div>

      {response != null && (
        <div className="p-4 rounded-md border border-border bg-background">
          <div className="text-sm text-muted-foreground mb-1">Response</div>
          <div className="whitespace-pre-wrap">{response}</div>
        </div>
      )}

      {(traceId || groupId) && (
        <div className="p-4 rounded-md border border-border bg-background space-y-2">
          <div className="text-sm font-medium">Trace</div>
          {traceId && (
            <div className="flex items-center gap-2 text-sm">
              <span>traceId: {traceId}</span>
              <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(traceId)}>Copy</Button>
            </div>
          )}
          {groupId && (
            <div className="text-sm">groupId: {groupId}</div>
          )}
          <div>
            <a className="text-sm underline" href="https://platform.openai.com/traces" target="_blank" rel="noreferrer">
              Open Traces Dashboard
            </a>
            <span className="ml-2 text-xs text-muted-foreground">Search by traceId if not auto-listed.</span>
          </div>
        </div>
      )}

      <div className="p-4 rounded-md border border-border bg-background space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Generate Sample Traces</div>
          <Button size="sm" onClick={() => runSamples.mutate({ count: 3, groupId: `samples-${Date.now()}` })} loading={runSamples.isPending}>
            {runSamples.isPending ? "Generating…" : "Generate 3 Traces"}
          </Button>
        </div>
        {groupId && (
          <div className="text-sm">groupId: {groupId}</div>
        )}
        {samples.length > 0 && (
          <div className="space-y-2">
            {samples.map(s => (
              <div key={s.index} className="text-sm flex items-center gap-2">
                <span>#{s.index + 1} {s.viaProxy ? "(proxy)" : "(fallback)"} – traceId: {s.traceId ?? "(none)"}</span>
                {s.traceId && (
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(s.traceId!)}>Copy</Button>
                )}
              </div>
            ))}
            <div>
              <a className="text-sm underline" href="https://platform.openai.com/traces" target="_blank" rel="noreferrer">Open Traces Dashboard</a>
              <span className="ml-2 text-xs text-muted-foreground">Search by groupId or traceId.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Diagnostics() {
  const [info, setInfo] = React.useState<any>(null);
  const run = useMutation({
    mutationKey: ["telemetry-diagnostics"],
    mutationFn: useConvexAction(api.simpleTest.telemetryDiagnostics),
    onSuccess: (data: any) => setInfo(data),
    onError: (err: unknown) => {
      console.error("Diagnostics failed:", err);
      toast.error("Diagnostics failed. Check console.");
    },
  });

  React.useEffect(() => {
    run.mutate({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 rounded-md border border-border bg-background space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Diagnostics</div>
        <Button size="sm" variant="outline" onClick={() => run.mutate({})} loading={run.isPending}>Refresh</Button>
      </div>
      {info ? (
        <div className="text-sm space-y-1">
          <div>Proxy URL: {info.proxyUrl ?? "(not set)"}</div>
          {info.proxyUrl && (
            <>
              <div>Proxy Reachable: {String(info.proxyReachable)}</div>
              <div>Proxy Health URL: {info.proxyHealthUrl ?? "(n/a)"}</div>
              <div>Proxy Has OPENAI Key: {info.proxyHasOpenAIKey === null ? "(unknown)" : String(info.proxyHasOpenAIKey)}</div>
              {info.proxyHealthError && (
                <div className="text-red-500">Proxy Health Error: {info.proxyHealthError}</div>
              )}
            </>
          )}
          <div>Server Has OPENAI Key: {String(info.hasServerOpenAIKey)}</div>
          <div>Phoenix Configured: {String(info.phoenixConfigured)}</div>
          <div>Env: {info.environment ?? "(n/a)"}</div>
          <div>Service: {info.serviceName}</div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Loading…</div>
      )}
    </div>
  );
}
