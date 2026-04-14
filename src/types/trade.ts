// src/types/trade.ts

export type TradeSide = 'buy' | 'sell';

export type Trade = {
  id: string;
  symbol: string;
  price: number;
  amount: number;
  side: TradeSide;
  timestamp: number;
};
