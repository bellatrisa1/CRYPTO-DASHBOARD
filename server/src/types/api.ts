export type SnapshotTrade = {
  id: string;
  symbol: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: number;
};

export type SnapshotPoint = {
  timestamp: number;
  price: number;
  volume: number;
};

export type SnapshotOrderBookLevel = {
  price: number;
  amount: number;
  total: number;
  side: 'bid' | 'ask';
};

export type SnapshotOrderBook = {
  bids: SnapshotOrderBookLevel[];
  asks: SnapshotOrderBookLevel[];
  spread: number;
  spreadPercent: number;
};

export type SnapshotMetric = {
  label: string;
  value: number;
  unit: '%';
};

export type SnapshotActivity = {
  region: string;
  value: number;
};

export type MarketSnapshotResponse = {
  symbol: string;
  points: SnapshotPoint[];
  trades: SnapshotTrade[];
  orderBook: SnapshotOrderBook;
  volume24h: number;
  metrics: SnapshotMetric[];
  activity: SnapshotActivity[];
};
