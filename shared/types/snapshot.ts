import type { SharedTelemetrySnapshot } from '../telemetry.js';

export type SharedTradingPair = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT';

export type SharedPricePoint = {
  timestamp: number;
  price: number;
  volume: number;
};

export type SharedTrade = {
  id: string;
  symbol: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: number;
};

export type SharedOrderBookSide = 'bid' | 'ask';

export type SharedOrderBookLevel = {
  price: number;
  amount: number;
  total: number;
  side: SharedOrderBookSide;
};

export type SharedOrderBookSnapshot = {
  bids: SharedOrderBookLevel[];
  asks: SharedOrderBookLevel[];
  spread: number;
  spreadPercent: number;
};

export type SharedMarketSnapshot = {
  symbol: SharedTradingPair | string;
  points: SharedPricePoint[];
  trades: SharedTrade[];
  orderBook: SharedOrderBookSnapshot;
  volume24h: number;
  metrics: SharedTelemetrySnapshot['metrics'];
  activity: SharedTelemetrySnapshot['activity'];
};