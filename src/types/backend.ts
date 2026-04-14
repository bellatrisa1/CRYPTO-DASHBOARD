export type BackendMarketTickEvent = {
  type: 'market.tick';
  payload: {
    symbol: string;
    timestamp: number;
    price: number;
    volume: number;
  };
};

export type BackendTradeEvent = {
  type: 'market.trade';
  payload: {
    id: string;
    symbol: string;
    timestamp: number;
    price: number;
    amount: number;
    side: 'buy' | 'sell';
  };
};

export type BackendOrderBookEvent = {
  type: 'market.orderbook';
  payload: {
    symbol: string;
    bids: Array<[number, number]>;
    asks: Array<[number, number]>;
  };
};

export type BackendTelemetryEvent = {
  type: 'telemetry.snapshot';
  payload: {
    metrics: Array<{
      label: string;
      value: number;
      unit: '%' | 'MB/s' | 'req/s';
    }>;
    activity: Array<{
      region: string;
      value: number;
    }>;
  };
};

export type BackendIncomingEvent =
  | BackendMarketTickEvent
  | BackendTradeEvent
  | BackendOrderBookEvent
  | BackendTelemetryEvent;
