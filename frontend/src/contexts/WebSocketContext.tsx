'use client';

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';

export interface WebSocketContextType {
  send: (data: string) => void;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://10.0.0.232:9987");
    
    ws.current.onopen = () => console.log('WS connected');
    ws.current.onmessage = (e) => console.log('WS message:', e.data);
    ws.current.onclose = () => console.log('WS closed');
    ws.current.onerror = (e) => console.error('WS error', e);

    return () => ws.current?.close();
  }, []);

  const send = (data: string) => {
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

export const useWebSocket = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
