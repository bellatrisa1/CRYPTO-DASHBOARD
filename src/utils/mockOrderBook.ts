import type { OrderBookLevel, OrderBookSnapshot } from '../types/orderBook';

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function buildLevels(
  side: 'bid' | 'ask',
  basePrice: number,
  levelsCount = 12
): OrderBookLevel[] {
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
}

export function generateMockOrderBook(basePrice: number): OrderBookSnapshot {
  const bids = buildLevels('bid', basePrice);
  const asks = buildLevels('ask', basePrice);

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
