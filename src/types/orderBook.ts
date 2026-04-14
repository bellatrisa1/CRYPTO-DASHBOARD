// src/types/orderBook.ts

export type OrderBookSide = 'bid' | 'ask';

export type OrderBookLevel = {
  price: number;
  amount: number;
  total: number;
  side: OrderBookSide;
};

export type OrderBookSnapshot = {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPercent: number;
};
