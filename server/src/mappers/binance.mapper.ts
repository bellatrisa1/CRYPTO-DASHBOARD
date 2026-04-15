type BinanceTradeMessage = {
  s: string;
  t: number;
  p: string;
  q: string;
  m: boolean;
  T: number;
};

export function mapBinanceTradeToFrontend(trade: BinanceTradeMessage) {
  return {
    id: String(trade.t),
    symbol: trade.s,
    price: Number(trade.p),
    amount: Number(trade.q),
    side: trade.m ? 'sell' : 'buy',
    timestamp: trade.T,
  };
}