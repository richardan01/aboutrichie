// Simple tracing implementation that works in Convex environment
// This creates structured logs that can be exported to observability platforms

interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operation: string;
  startTime: number;
  attributes: Record<string, string | number | boolean>;
}

interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, string | number | boolean>;
}

class SimpleSpan {
  private context: TraceContext;
  private events: SpanEvent[] = [];
  private endTime?: number;
  private status: { code: 'OK' | 'ERROR'; message?: string } = { code: 'OK' };

  constructor(
    operation: string,
    attributes: Record<string, string | number | boolean> = {},
    parentSpanId?: string
  ) {
    this.context = {
      traceId: this.generateId(),
      spanId: this.generateId(),
      parentSpanId,
      operation,
      startTime: Date.now(),
      attributes: {
        'service.name': 'ai-storefront',
        'service.version': '1.0.0',
        ...attributes,
      },
    };
  }

  setAttribute(key: string, value: string | number | boolean): void {
    this.context.attributes[key] = value;
  }

  setAttributes(attributes: Record<string, string | number | boolean>): void {
    Object.assign(this.context.attributes, attributes);
  }

  addEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
    this.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    });
  }

  setStatus(status: { code: 'OK' | 'ERROR'; message?: string }): void {
    this.status = status;
  }

  end(): void {
    this.endTime = Date.now();
    this.logTrace();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private logTrace(): void {
    const duration = this.endTime! - this.context.startTime;
    
    // Create structured log entry
    const traceLog = {
      timestamp: new Date(this.context.startTime).toISOString(),
      level: this.status.code === 'ERROR' ? 'ERROR' : 'INFO',
      message: `TRACE: ${this.context.operation}`,
      trace: {
        traceId: this.context.traceId,
        spanId: this.context.spanId,
        parentSpanId: this.context.parentSpanId,
        operation: this.context.operation,
        duration: `${duration}ms`,
        status: this.status.code,
        ...(this.status.message && { error: this.status.message }),
      },
      attributes: this.context.attributes,
      ...(this.events.length > 0 && { events: this.events }),
    };

    // Log as structured JSON that can be ingested by log aggregation systems
    console.log('🔍 TRACE:', JSON.stringify(traceLog, null, 2));
  }
}

// Simple tracer implementation
class SimpleTracer {
  private activeSpans: SimpleSpan[] = [];

  startSpan(
    operation: string,
    attributes: Record<string, string | number | boolean> = {}
  ): SimpleSpan {
    const parentSpanId = this.activeSpans.length > 0 
      ? this.activeSpans[this.activeSpans.length - 1]['context'].spanId 
      : undefined;
    
    const span = new SimpleSpan(operation, attributes, parentSpanId);
    this.activeSpans.push(span);
    return span;
  }

  finishSpan(span: SimpleSpan): void {
    const index = this.activeSpans.indexOf(span);
    if (index > -1) {
      this.activeSpans.splice(index, 1);
    }
    span.end();
  }

  withSpan<T>(
    operation: string,
    attributes: Record<string, string | number | boolean>,
    fn: (span: SimpleSpan) => Promise<T>
  ): Promise<T> {
    const span = this.startSpan(operation, attributes);
    
    return fn(span)
      .then((result) => {
        span.setStatus({ code: 'OK' });
        return result;
      })
      .catch((error) => {
        span.setStatus({ 
          code: 'ERROR', 
          message: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      })
      .finally(() => {
        this.finishSpan(span);
      });
  }
}

// Global tracer instance
const tracer = new SimpleTracer();

// LLM-specific tracing helpers
export async function traceLLMCall<T>(
  operationName: string,
  options: {
    model: string;
    provider: string;
    inputTokens?: number;
    outputTokens?: number;
    temperature?: number;
    maxTokens?: number;
    prompt?: string;
    response?: string;
    userId?: string;
    threadId?: string;
  },
  operation: (span: SimpleSpan) => Promise<T>
): Promise<T> {
  return tracer.withSpan(
    operationName,
    {
      'llm.vendor': options.provider,
      'llm.request.model': options.model,
      'llm.request.temperature': options.temperature || 0,
      'llm.request.max_tokens': options.maxTokens || 0,
      'llm.usage.prompt_tokens': options.inputTokens || 0,
      'llm.usage.completion_tokens': options.outputTokens || 0,
      'llm.usage.total_tokens': (options.inputTokens || 0) + (options.outputTokens || 0),
      'user.id': options.userId || '',
      'thread.id': options.threadId || '',
      'prompt.length': options.prompt?.length || 0,
      'response.length': options.response?.length || 0,
    },
    async (span) => {
      // Add prompt event (truncated for safety)
      if (options.prompt) {
        span.addEvent('llm.prompt', {
          'prompt.preview': options.prompt.substring(0, 100) + (options.prompt.length > 100 ? '...' : ''),
        });
      }

      const result = await operation(span);

      // Add response event
      if (options.response) {
        span.addEvent('llm.response', {
          'response.preview': options.response.substring(0, 100) + (options.response.length > 100 ? '...' : ''),
          'response.length': options.response.length,
        });
      }

      return result;
    }
  );
}

// Chat turn tracing
export async function traceChatTurn<T>(
  operationName: string,
  options: {
    userId?: string;
    threadId: string;
    messageCount?: number;
    turnId?: string;
  },
  operation: () => Promise<T>
): Promise<T> {
  return tracer.withSpan(
    `chat.${operationName}`,
    {
      'chat.thread_id': options.threadId,
      'chat.user_id': options.userId || '',
      'chat.message_count': options.messageCount || 0,
      'chat.turn_id': options.turnId || Date.now().toString(),
    },
    async (span) => {
      span.addEvent('chat.turn.start');
      const result = await operation();
      span.addEvent('chat.turn.complete');
      return result;
    }
  );
}

// Helper functions for current span
export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  // In this simple implementation, we don't track current span context
  // This would be logged with the next span operation
  console.log('📝 Span Attributes:', attributes);
}

export function addSpanEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
  console.log('📋 Span Event:', { name, attributes, timestamp: Date.now() });
}

// Performance timing helper
export function timeOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  return operation()
    .then((result) => {
      const duration = Date.now() - startTime;
      console.log(`⏱️ ${operationName}: ${duration}ms`);
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      console.log(`⏱️ ${operationName}: ${duration}ms (ERROR: ${error.message})`);
      throw error;
    });
}

export { tracer };