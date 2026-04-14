import { useEffect } from 'react';
import { WsClient } from '../services/wsClient';
import { routeIncomingMessage } from '../services/wsRouter';
import { useMarketStore } from '../store/marketStore';

type UseWebSocketStreamOptions = {
  enabled?: boolean;
  url: string;
};

export function useWebSocketStream({
  enabled = false,
  url,
}: UseWebSocketStreamOptions) {
  const setStreamStatus = useMarketStore((state) => state.setStreamStatus);
  const setReconnectMeta = useMarketStore((state) => state.setReconnectMeta);
  const resetReconnectMeta = useMarketStore((state) => state.resetReconnectMeta);
  const setLatency = useMarketStore((state) => state.setLatency);

  useEffect(() => {
    if (!enabled) return;

    const client = new WsClient({
      url,
      maxReconnectAttempts: 8,
      reconnectBaseDelayMs: 1000,
      reconnectMaxDelayMs: 15000,
      onOpen: () => {
        setStreamStatus('open');
        resetReconnectMeta();
      },
      onMessage: (raw) => {
        const startedAt = performance.now();
        routeIncomingMessage(raw);
        const endedAt = performance.now();
        setLatency(Math.round(endedAt - startedAt));
      },
      onClose: () => {
        setStreamStatus('closed');
        setLatency(null);
      },
      onError: () => {
        setStreamStatus('error');
        setLatency(null);
      },
      onReconnectScheduled: (attempt, delayMs) => {
        setStreamStatus('reconnecting');
        setReconnectMeta(attempt, delayMs);
      },
    });

    setStreamStatus('connecting');
    client.connect();

    return () => {
      client.disconnect();
      setStreamStatus('closed');
      resetReconnectMeta();
      setLatency(null);
    };
  }, [
    enabled,
    url,
    setStreamStatus,
    setReconnectMeta,
    resetReconnectMeta,
    setLatency,
  ]);
}