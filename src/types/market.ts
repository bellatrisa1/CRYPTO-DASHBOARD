export type TradingPair = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT';

export type PricePoint = {
  timestamp: number;
  price: number;
  volume: number;
};

export type MarketStat = {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
};