import { describe, expect, it } from 'vitest';
import {
  mapBackendOrderBookToSnapshot,
  mapBackendTelemetry,
  mapBackendTickToPricePoint,
  mapBackendTradeToTrade,
} from './backend';

describe('backend mappers', () => {
  it('maps backend tick to PricePoint', () => {
    const result = mapBackendTickToPricePoint({
      type: 'market.tick',
      payload: {
        symbol: 'BTCUSDT',
        timestamp: 1710000000000,
        price: 84500,
        volume: 320,
      },
    });

    expect(result).toEqual({
      timestamp: 1710000000000,
      price: 84500,
      volume: 320,
    });
  });

  it('maps backend trade to Trade', () => {
    const result = mapBackendTradeToTrade({
      type: 'market.trade',
      payload: {
        id: 't-1',
        symbol: 'BTCUSDT',
        timestamp: 1710000000000,
        price: 84400,
        amount: 0.45,
        side: 'sell',
      },
    });

    expect(result).toEqual({
      id: 't-1',
      symbol: 'BTCUSDT',
      timestamp: 1710000000000,
      price: 84400,
      amount: 0.45,
      side: 'sell',
    });
  });

  it('maps backend orderbook', () => {
    const result = mapBackendOrderBookToSnapshot({
      type: 'market.orderbook',
      payload: {
        symbol: 'BTCUSDT',
        bids: [
          [84200, 1.5],
          [84190, 2.0],
        ],
        asks: [
          [84210, 1.2],
          [84220, 1.3],
        ],
      },
    });

    expect(result.spread).toBe(10);
    expect(result.bids[0].price).toBe(84200);
    expect(result.asks[0].price).toBe(84210);
  });

  it('maps backend telemetry snapshot', () => {
    const result = mapBackendTelemetry({
      type: 'telemetry.snapshot',
      payload: {
        metrics: [{ label: 'CPU', value: 72, unit: '%' }],
        activity: [{ region: 'Europe', value: 74 }],
      },
    });

    expect(result.metrics).toHaveLength(1);
    expect(result.activity).toHaveLength(1);
  });
});
