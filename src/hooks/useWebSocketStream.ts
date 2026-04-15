import { useEffect } from 'react';
import { WsClient } from '../services/wsClient';
import { routeIncomingMessage } from '../services/wsRouter';
import { useMarketStore } from '../store/marketStore';

type UseWebSocketStreamOptions = {
  enabled?: boolean;
  url: string;
  symbol: string;
};

export function useWebSocketStream({
  enabled = false,
  url,
  symbol,
}: UseWebSocketStreamOptions) {
  const setStreamStatus = useMarketStore((state) => state.setStreamStatus);
  const setReconnectMeta = useMarketStore((state) => state.setReconnectMeta);
  const resetReconnectMeta = useMarketStore((state) => state.resetReconnectMeta);
  const setLatency = useMarketStore((state) => state.setLatency);

  useEffect(() => {
    if (!enabled) return;

    let pingInterval: number | null = null;

    const client = new WsClient({
      url,
      maxReconnectAttempts: 8,
      reconnectBaseDelayMs: 1000,
      reconnectMaxDelayMs: 15000,
      onOpen: () => {
        setStreamStatus('open');
        resetReconnectMeta();

        client.send(
          JSON.stringify({
            type: 'subscribe',
            symbol,
          }),
        );

        pingInterval = window.setInterval(() => {
          client.send(
            JSON.stringify({
              type: 'ping',
              timestamp: Date.now(),
            }),
          );
        }, 2000);
      },
      onMessage: (raw) => {
        routeIncomingMessage(raw);
      },
      onClose: () => {
        setStreamStatus('closed');
        setLatency(null);

        if (pingInterval !== null) {
          window.clearInterval(pingInterval);
          pingInterval = null;
        }
      },
      onError: () => {
        setStreamStatus('error');
        setLatency(null);

        if (pingInterval !== null) {
          window.clearInterval(pingInterval);
          pingInterval = null;
        }
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

      if (pingInterval !== null) {
        window.clearInterval(pingInterval);
      }
    };
  }, [
    enabled,
    url,
    symbol,
    setStreamStatus,
    setReconnectMeta,
    resetReconnectMeta,
    setLatency,
  ]);
}