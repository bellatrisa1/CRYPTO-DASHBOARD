import type { TradingPair } from '../types/market';
import type { MarketSnapshot } from '../types/snapshot';

const API_BASE_URL = 'http://localhost:3002';

export async function fetchMarketSnapshot(
  symbol: TradingPair
): Promise<MarketSnapshot> {
  const response = await fetch(
    `${API_BASE_URL}/api/market/snapshot?symbol=${encodeURIComponent(symbol)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch snapshot: ${response.status}`);
  }

  const data = (await response.json()) as MarketSnapshot;

  return data;
}
