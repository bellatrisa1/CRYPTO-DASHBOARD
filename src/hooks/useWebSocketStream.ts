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
        routeIncomingMessage(raw);
      },
      onClose: () => {
        setStreamStatus('closed');
      },
      onError: () => {
        setStreamStatus('error');
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
    };
  }, [enabled, url, setStreamStatus, setReconnectMeta, resetReconnectMeta]);
}