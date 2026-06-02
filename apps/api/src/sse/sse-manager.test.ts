import { EventEmitter } from 'node:events';

import { describe, expect, it, vi } from 'vitest';

import { mkSseEvent, SseManager } from './sse-manager.js';

function createMockResponse(): EventEmitter & {
  setHeader: ReturnType<typeof vi.fn>;
  write: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
  writableEnded: boolean;
  flushHeaders?: () => void;
} {
  const res = new EventEmitter() as EventEmitter & {
    setHeader: ReturnType<typeof vi.fn>;
    write: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
    writableEnded: boolean;
    flushHeaders?: () => void;
  };
  res.setHeader = vi.fn();
  res.write = vi.fn();
  res.end = vi.fn();
  res.writableEnded = false;
  res.flushHeaders = vi.fn();
  return res;
}

describe('SseManager', () => {
  it('sets SSE headers on register', () => {
    const sse = new SseManager();
    const res = createMockResponse();
    sse.register('scan-1', res as never);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
  });

  it('is a no-op when client disconnected', () => {
    const sse = new SseManager();
    expect(() =>
      sse.emit('missing', mkSseEvent('scan:started', 'missing', {})),
    ).not.toThrow();
  });

  it('writes event data to an active stream', () => {
    const sse = new SseManager();
    const res = createMockResponse();
    sse.register('scan-2', res as never);
    sse.emit('scan-2', mkSseEvent('scan:tree_done', 'scan-2', { ok: true }));
    expect(res.write).toHaveBeenCalled();
  });
});
