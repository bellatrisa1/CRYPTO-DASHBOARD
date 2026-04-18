import type { SharedTrade } from '../../../shared/types/snapshot.js';

type BinanceTradeMessage = {
  e: 'trade';
  E: number;
  s: string;
  t: number;
  p: string;
  q: string;
  b: number;
  a: number;
  T: number;
  m: boolean;
  M: boolean;
};

export function mapBinanceTradeToFrontend(
  trade: BinanceTradeMessage,
): SharedTrade {
  return {
    id: String(trade.t),
    symbol: trade.s,
    price: Number(trade.p),
    amount: Number(trade.q),
    side: trade.m ? 'sell' : 'buy',
    timestamp: trade.T,
  };
}