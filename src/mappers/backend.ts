import type { BackendIncomingEvent } from '../types/backend';
import type { OrderBookLevel, OrderBookSnapshot } from '../types/orderBook';
import type { PricePoint } from '../types/market';
import type { Trade } from '../types/trade';
import type { RegionActivity, SystemMetric } from '../types/telemetry';

function toOrderBookLevels(
  levels: Array<[number, number]>,
  side: 'bid' | 'ask'
): OrderBookLevel[] {
  let cumulative = 0;

  return levels.map(([price, amount]) => {
    cumulative += amount;

    return {
      price: Number(price.toFixed(2)),
      amount: Number(amount.toFixed(6)),
      total: Number(cumulative.toFixed(6)),
      side,
    };
  });
}

export function mapBackendTickToPricePoint(
  event: Extract<BackendIncomingEvent, { type: 'market.tick' }>
): PricePoint {
  return {
    timestamp: event.payload.timestamp,
    price: event.payload.price,
    volume: event.payload.volume,
  };
}

export function mapBackendTradeToTrade(
  event: Extract<BackendIncomingEvent, { type: 'market.trade' }>
): Trade {
  return {
    id: event.payload.id,
    symbol: event.payload.symbol,
    timestamp: event.payload.timestamp,
    price: event.payload.price,
    amount: event.payload.amount,
    side: event.payload.side,
  };
}

export function mapBackendOrderBookToSnapshot(
  event: Extract<BackendIncomingEvent, { type: 'market.orderbook' }>
): OrderBookSnapshot {
  const bids = toOrderBookLevels(event.payload.bids, 'bid');
  const asks = toOrderBookLevels(event.payload.asks, 'ask');

  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;
  const spread = Number((bestAsk - bestBid).toFixed(2));
  const spreadPercent =
    bestAsk > 0 ? Number(((spread / bestAsk) * 100).toFixed(4)) : 0;

  return {
    bids,
    asks,
    spread,
    spreadPercent,
  };
}

export function mapBackendTelemetry(
  event: Extract<BackendIncomingEvent, { type: 'telemetry.snapshot' }>
): {
  metrics: SystemMetric[];
  activity: RegionActivity[];
} {
  return {
    metrics: event.payload.metrics,
    activity: event.payload.activity,
  };
}
