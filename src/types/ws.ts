import type { PricePoint } from './market';
import type { OrderBookSnapshot } from './orderBook';
import type { Trade } from './trade';

export type StreamStatus =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'closed'
  | 'error';

export type MarketTickMessage = {
  type: 'market_tick';
  payload: PricePoint;
};

export type TradeMessage = {
  type: 'trade';
  payload: Trade;
};

export type OrderBookMessage = {
  type: 'order_book';
  payload: OrderBookSnapshot;
};

export type WsIncomingMessage =
  | MarketTickMessage
  | TradeMessage
  | OrderBookMessage;
