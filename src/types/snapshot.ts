import type { PricePoint, TradingPair } from './market';
import type { OrderBookSnapshot } from './orderBook';
import type { RegionActivity, SystemMetric } from './telemetry';
import type { Trade } from './trade';

export type MarketSnapshot = {
  symbol: TradingPair;
  points: PricePoint[];
  trades: Trade[];
  orderBook: OrderBookSnapshot;
  metrics: SystemMetric[];
  activity: RegionActivity[];
  volume24h: number;
};
