import type { TradingPair } from '../types/market';
import {
  REALTIME_SOURCE,
  LOCAL_WS_URL,
  type RealtimeSource,
} from '../config/env';
import { buildBinanceStreamUrl } from '../config/market';

export function getRealtimeSource(): RealtimeSource {
  return REALTIME_SOURCE;
}

export function buildRealtimeUrl(symbol: TradingPair): string | null {
  switch (REALTIME_SOURCE) {
    case 'binance':
      return buildBinanceStreamUrl(symbol);

    case 'local':
      return `${LOCAL_WS_URL}?symbol=${symbol}`;

    case 'mock':
      return null;

    default:
      return null;
  }
}
