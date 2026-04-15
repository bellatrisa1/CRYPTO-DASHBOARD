import type { MarketSnapshotResponse } from '../types/api.js';
import { generateTelemetry } from '../telemetry/generator.js';

const DEFAULT_VOLUME_24H = 28_457_321;
const CHART_POINTS = 48;
const TRADES_COUNT = 18;
const ORDER_BOOK_LEVELS = 20;

function getBasePriceBySymbol(symbol: string): number {
  switch (symbol.toUpperCase()) {
    case 'BTCUSDT':
      return 84200;
    case 'ETHUSDT':
      return 3200;
    case 'SOLUSDT':
      return 185;
    default:
      return 1000;
  }
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generatePriceSeries(
  symbol: string,
  points = CHART_POINTS
): MarketSnapshotResponse['points'] {
  const basePrice = getBasePriceBySymbol(symbol);
  const now = Date.now();
  const step = 60 * 1000;

  const result: MarketSnapshotResponse['points'] = [];
  let currentPrice = basePrice;

  for (let index = points - 1; index >= 0; index -= 1) {
    const timestamp = now - index * step;
    const drift = randomInRange(-180, 220);
    currentPrice = Math.max(1, currentPrice + drift);

    result.push({
      timestamp,
      price: Number(currentPrice.toFixed(2)),
      volume: Number(randomInRange(120, 1500).toFixed(2)),
    });
  }

  return result;
}

function generateTrades(
  symbol: string,
  basePrice: number,
  count = TRADES_COUNT
): MarketSnapshotResponse['trades'] {
  return Array.from({ length: count }).map((_, index) => {
    const side: 'buy' | 'sell' = index % 2 === 0 ? 'buy' : 'sell';
    const drift = (Math.random() - 0.5) * Math.max(basePrice * 0.0025, 0.5);
    const price = Number((basePrice + drift).toFixed(2));

    return {
      id: `${symbol}-snapshot-trade-${index}`,
      symbol,
      price,
      amount: Number((Math.random() * 1.8 + 0.15).toFixed(3)),
      side,
      timestamp: Date.now() - index * 15_000,
    };
  });
}

function generateOrderBook(
  symbol: string,
  levelsCount = ORDER_BOOK_LEVELS
): MarketSnapshotResponse['orderBook'] {
  const basePrice = getBasePriceBySymbol(symbol);

  const buildSide = (
    side: 'bid' | 'ask'
  ): MarketSnapshotResponse['orderBook']['bids'] => {
    const rawLevels = Array.from({ length: levelsCount }).map((_, index) => {
      const step = randomInRange(6, 28) * (index + 1);
      const price =
        side === 'bid'
          ? Number((basePrice - step).toFixed(2))
          : Number((basePrice + step).toFixed(2));

      return {
        price,
        amount: Number(randomInRange(0.15, 3.6).toFixed(3)),
        total: 0,
        side,
      };
    });

    let cumulative = 0;

    return rawLevels.map((level) => {
      cumulative += level.amount;

      return {
        ...level,
        total: Number(cumulative.toFixed(3)),
      };
    });
  };

  const bids = buildSide('bid');
  const asks = buildSide('ask');

  const bestBid = bids[0]?.price ?? basePrice;
  const bestAsk = asks[0]?.price ?? basePrice;
  const spread = Number((bestAsk - bestBid).toFixed(2));
  const spreadPercent = Number(((spread / bestAsk || 0) * 100).toFixed(4));

  return {
    bids,
    asks,
    spread,
    spreadPercent,
  };
}

export function createMarketSnapshot(symbol: string): MarketSnapshotResponse {
  const normalizedSymbol = symbol.toUpperCase();
  const points = generatePriceSeries(normalizedSymbol);
  const lastPrice =
    points[points.length - 1]?.price ?? getBasePriceBySymbol(normalizedSymbol);
  const telemetry = generateTelemetry();

  return {
    symbol: normalizedSymbol,
    points,
    trades: generateTrades(normalizedSymbol, lastPrice),
    orderBook: generateOrderBook(normalizedSymbol),
    volume24h: DEFAULT_VOLUME_24H,
    metrics: telemetry.metrics,
    activity: telemetry.activity,
  };
}
