type BinanceDepth = {
  bids: [string, string][];
  asks: [string, string][];
};

type OrderBookLevel = {
  price: number;
  amount: number;
  total: number;
  side: 'bid' | 'ask';
};

export function mapBinanceDepthToOrderBook(depth: BinanceDepth) {
  const mapSide = (
    levels: [string, string][],
    side: 'bid' | 'ask'
  ): OrderBookLevel[] => {
    let cumulative = 0;

    return levels.map(([price, qty]) => {
      const p = Number(price);
      const a = Number(qty);

      cumulative += a;

      return {
        price: p,
        amount: a,
        total: cumulative,
        side,
      };
    });
  };

  const bids = mapSide(depth.bids, 'bid');
  const asks = mapSide(depth.asks, 'ask');

  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;

  const spread = bestAsk - bestBid;
  const spreadPercent = bestBid ? (spread / bestBid) * 100 : 0;

  return {
    bids,
    asks,
    spread,
    spreadPercent,
  };
}
