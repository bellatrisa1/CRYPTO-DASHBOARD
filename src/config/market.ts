import type { TradingPair } from '../types/market';

export const SUPPORTED_PAIRS: TradingPair[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

export const MAX_VISIBLE_TRADES = 12;
export const MAX_CHART_POINTS = 48;
export const MINI_CHART_POINTS = 30;
export const ORDER_BOOK_LEVELS = 20;

export function buildBinanceStreamUrl(symbol: TradingPair): string {
  const stream = symbol.toLowerCase();
  

  return `wss://stream.binance.com:9443/stream?streams=${stream}@aggTrade/${stream}@depth20@100ms`;
}
