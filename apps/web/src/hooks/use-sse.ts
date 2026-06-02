import type { SseEvent } from '@slop-scanner/shared-types';
import { useEffect } from 'react';

import { scanStreamPath } from '../constants/api.js';
import { fetchScanResult } from '../services/scan-api.js';
import { useScanStore } from '../stores/scan.store.js';

const RECONNECT_DELAY_MS = 2000;

/** Subscribe to scan progress SSE with reconnect fallback to REST. */
export function useSse(scanId: string | null): void {
  const dispatchSseEvent = useScanStore((state) => state.dispatchSseEvent);
  const restoreResult = useScanStore((state) => state.restoreFromApi);

  useEffect(() => {
    if (!scanId) return;

    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let es: EventSource | null = null;

    const connect = () => {
      es = new EventSource(scanStreamPath(scanId), { withCredentials: true });

      es.onmessage = (message) => {
        const event = JSON.parse(message.data) as SseEvent;
        dispatchSseEvent(event);
      };

      es.onerror = () => {
        es?.close();
        if (closed) return;

        reconnectTimer = setTimeout(() => {
          void fetchScanResult(scanId)
            .then((result) => {
              restoreResult(result);
            })
            .catch(() => {
              dispatchSseEvent({
                type: 'scan:error',
                scanId,
                payload: null,
                timestamp: new Date().toISOString(),
              });
            });
        }, RECONNECT_DELAY_MS);
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [scanId, dispatchSseEvent, restoreResult]);
}
