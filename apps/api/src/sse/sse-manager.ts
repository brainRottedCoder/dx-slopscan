import type { ServerResponse } from 'node:http';

import type { SseEvent } from '@slop-scanner/shared-types';

/** Manages active SSE connections keyed by scan id. */
export class SseManager {
  private readonly streams = new Map<string, ServerResponse>();

  register(scanId: string, res: ServerResponse): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    this.streams.set(scanId, res);
    res.on('close', () => {
      this.streams.delete(scanId);
    });
  }

  emit<T>(scanId: string, event: SseEvent<T>): void {
    const stream = this.streams.get(scanId);
    if (!stream || stream.writableEnded) return;
    stream.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  close(scanId: string): void {
    const stream = this.streams.get(scanId);
    if (stream && !stream.writableEnded) {
      stream.end();
    }
    this.streams.delete(scanId);
  }

  hasConnection(scanId: string): boolean {
    return this.streams.has(scanId);
  }
}

/** Build a typed SSE envelope. */
export function mkSseEvent<T>(
  type: SseEvent['type'],
  scanId: string,
  payload: T,
): SseEvent<T> {
  return {
    type,
    scanId,
    payload,
    timestamp: new Date().toISOString(),
  };
}
