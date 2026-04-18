import type { TradingPair } from '../types/market';
import type { MarketSnapshot } from '../types/snapshot';
import { API_BASE_URL } from '../config/env';

export async function fetchMarketSnapshot(
  symbol: TradingPair,
): Promise<MarketSnapshot> {
  const response = await fetch(
    `${API_BASE_URL}/api/market/snapshot?symbol=${encodeURIComponent(symbol)}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch snapshot: ${response.status}`);
  }

  return (await response.json()) as MarketSnapshot;
}