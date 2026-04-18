import type { SharedOrderBookSnapshot } from '../../../shared/types/snapshot.js';

type BinanceDepthMessage = {
  bids: [string, string][];
  asks: [string, string][];
};

export function mapBinanceDepthToOrderBook(
  depth: BinanceDepthMessage
): SharedOrderBookSnapshot {
  const bids = depth.bids.map(([price, amount]) => ({
    price: Number(price),
    amount: Number(amount),
    total: 0,
    side: 'bid' as const,
  }));

  const asks = depth.asks.map(([price, amount]) => ({
    price: Number(price),
    amount: Number(amount),
    total: 0,
    side: 'ask' as const,
  }));

  let bidTotal = 0;
  for (const level of bids) {
    bidTotal += level.amount;
    level.total = bidTotal;
  }

  let askTotal = 0;
  for (const level of asks) {
    askTotal += level.amount;
    level.total = askTotal;
  }

  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;
  const spread = bestAsk - bestBid;
  const spreadPercent = bestBid !== 0 ? (spread / bestBid) * 100 : 0;

  return {
    bids,
    asks,
    spread,
    spreadPercent,
  };
}
