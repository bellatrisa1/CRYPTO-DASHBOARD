import { useEffect } from 'react';
import { routeIncomingMessage } from '../services/wsRouter';
import { useMarketStore } from '../store/marketStore';
import { generateMockOrderBook } from '../utils/mockOrderBook';

type UseMockMarketStreamOptions = {
  enabled?: boolean;
};

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function useMockMarketStream({
  enabled = false,
}: UseMockMarketStreamOptions) {
  const setStreamStatus = useMarketStore((state) => state.setStreamStatus);

  useEffect(() => {
    if (!enabled) return;

    setStreamStatus('open');

    const interval = window.setInterval(() => {
      const currentState = useMarketStore.getState();
      const currentPoints = currentState.points;
      const lastPoint = currentPoints[currentPoints.length - 1];
      const lastPrice = lastPoint?.price ?? 84200;

      const drift = randomInRange(-120, 160);
      const nextPrice = Math.max(1, lastPrice + drift);
      const timestamp = Date.now();

      const marketTickMessage = JSON.stringify({
        type: 'market_tick',
        payload: {
          timestamp,
          price: Number(nextPrice.toFixed(2)),
          volume: Number(randomInRange(80, 1500).toFixed(2)),
        },
      });

      const tradeMessage = JSON.stringify({
        type: 'trade',
        payload: {
          id: crypto.randomUUID(),
          symbol: currentState.symbol,
          price: Number(nextPrice.toFixed(2)),
          amount: Number(randomInRange(0.05, 2.4).toFixed(3)),
          side: nextPrice >= lastPrice ? 'buy' : 'sell',
          timestamp,
        },
      });

      const orderBookMessage = JSON.stringify({
        type: 'order_book',
        payload: generateMockOrderBook(nextPrice),
      });

      routeIncomingMessage(marketTickMessage);
      routeIncomingMessage(tradeMessage);
      routeIncomingMessage(orderBookMessage);
      useMarketStore.getState().updateTelemetry();
    }, 500);

    return () => {
      window.clearInterval(interval);
      setStreamStatus('closed');
    };
  }, [enabled, setStreamStatus]);
}