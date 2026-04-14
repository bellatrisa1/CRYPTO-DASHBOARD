import { useEffect } from 'react';
import { fetchMarketSnapshot } from '../services/api';
import { useMarketStore } from '../store/marketStore';
import type { TradingPair } from '../types/market';

type UseMarketSnapshotOptions = {
  symbol: TradingPair;
  enabled?: boolean;
};

export function useMarketSnapshot({
  symbol,
  enabled = true,
}: UseMarketSnapshotOptions) {
  const setSnapshot = useMarketStore((state) => state.setSnapshot);
  const setStreamStatus = useMarketStore((state) => state.setStreamStatus);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function load() {
      try {
        setStreamStatus('connecting');
        const snapshot = await fetchMarketSnapshot(symbol);

        if (cancelled) return;

        setSnapshot(snapshot);
      } catch (error) {
        console.error('Failed to load market snapshot:', error);

        if (cancelled) return;

        setStreamStatus('error');
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [symbol, enabled, setSnapshot, setStreamStatus]);
}