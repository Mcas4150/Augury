'use client';

import { createContext, useContext, useEffect, useRef } from 'react';

export const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://10.0.0.232:9987");
    
    ws.current.onopen = () => console.log('WS connected');
    ws.current.onmessage = (e) => console.log('WS message:', e.data);
    ws.current.onclose = () => console.log('WS closed');
    ws.current.onerror = (e) => console.error('WS error', e);

    return () => ws.current?.close();
  }, []);

  const send = (data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    }
  };

  return (
    <WebSocketContext.Provider value={{ send }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
