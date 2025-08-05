'use client';

import { useEffect, useRef } from 'react';

export function useWebSocket(url: string) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen    = () => console.log('WS connected');
    ws.current.onmessage = (e) => console.log('WS message:', e.data);
    ws.current.onclose   = () => console.log('WS closed');
    ws.current.onerror   = (e) => console.error('WS error', e);

    return () => ws.current?.close();
  }, [url]);

  const send = (data: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    }
  };

  return { send };
}
