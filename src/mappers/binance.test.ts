import { describe, expect, it } from 'vitest';
import {
  mapBinanceDepthToOrderBook,
  mapBinanceTradeToPricePoint,
  mapBinanceTradeToTrade,
} from './binance';

describe('binance mappers', () => {
  it('maps Binance trade to Trade', () => {
    const result = mapBinanceTradeToTrade({
      e: 'aggTrade',
      E: 1710000000000,
      s: 'BTCUSDT',
      p: '84250.55',
      q: '0.125',
      m: false,
    });

    expect(result.symbol).toBe('BTCUSDT');
    expect(result.price).toBe(84250.55);
    expect(result.amount).toBe(0.125);
    expect(result.side).toBe('buy');
    expect(result.timestamp).toBe(1710000000000);
  });

  it('maps Binance trade to PricePoint', () => {
    const result = mapBinanceTradeToPricePoint({
      e: 'aggTrade',
      E: 1710000000000,
      s: 'BTCUSDT',
      p: '84250.55',
      q: '0.125',
      m: true,
    });

    expect(result).toEqual({
      timestamp: 1710000000000,
      price: 84250.55,
      volume: 0.125,
    });
  });

  it('maps Binance depth to OrderBookSnapshot', () => {
    const result = mapBinanceDepthToOrderBook({
      lastUpdateId: 1,
      bids: [
        ['84200.00', '1.5'],
        ['84190.00', '2.0'],
      ],
      asks: [
        ['84210.00', '1.2'],
        ['84220.00', '1.3'],
      ],
    });

    expect(result.bids).toHaveLength(2);
    expect(result.asks).toHaveLength(2);
    expect(result.spread).toBe(10);
    expect(result.spreadPercent).toBeCloseTo((10 / 84210) * 100, 4);
  });
});
