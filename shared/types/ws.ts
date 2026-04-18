import type {
  SharedOrderBookSnapshot,
  SharedPricePoint,
  SharedTrade,
} from './snapshot.js';
import type { SharedTelemetrySnapshot } from '../telemetry.js';

export type SharedWsTradeEvent = {
  type: 'trade';
  payload: SharedTrade;
};

export type SharedWsOrderBookEvent = {
  type: 'order_book';
  payload: SharedOrderBookSnapshot;
};

export type SharedWsMarketTickEvent = {
  type: 'market_tick';
  payload: SharedPricePoint;
};

export type SharedWsTelemetryEvent = {
  type: 'telemetry.snapshot';
  payload: SharedTelemetrySnapshot;
};

export type SharedWsPingEvent = {
  type: 'ping';
  timestamp: number;
};

export type SharedWsPongEvent = {
  type: 'pong';
  timestamp: number;
};

export type SharedWsSubscribeEvent = {
  type: 'subscribe';
  symbol: string;
};

export type SharedServerToClientEvent =
  | SharedWsTradeEvent
  | SharedWsOrderBookEvent
  | SharedWsMarketTickEvent
  | SharedWsTelemetryEvent
  | SharedWsPongEvent;

export type SharedClientToServerEvent =
  | SharedWsPingEvent
  | SharedWsSubscribeEvent;
