import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routeIncomingMessage } from './wsRouter';
import { useMarketStore } from '../store/marketStore';

vi.mock('../store/marketStore', () => {
  return {
    useMarketStore: {
      getState: vi.fn(),
    },
  };
});

describe('wsRouter', () => {
  const pushPoint = vi.fn();
  const pushTrade = vi.fn();
  const setOrderBook = vi.fn();
  const setTelemetrySnapshot = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMarketStore.getState).mockReturnValue({
      pushPoint,
      pushTrade,
      setOrderBook,
      setTelemetrySnapshot,
    } as never);
  });

  it('routes internal market_tick message', () => {
    routeIncomingMessage(
      JSON.stringify({
        type: 'market_tick',
        payload: {
          timestamp: 1,
          price: 100,
          volume: 50,
        },
      })
    );

    expect(pushPoint).toHaveBeenCalledTimes(1);
  });

  it('routes backend telemetry snapshot', () => {
    routeIncomingMessage(
      JSON.stringify({
        type: 'telemetry.snapshot',
        payload: {
          metrics: [{ label: 'CPU', value: 72, unit: '%' }],
          activity: [{ region: 'Europe', value: 80 }],
        },
      })
    );

    expect(setTelemetrySnapshot).toHaveBeenCalledTimes(1);
  });

  it('routes Binance trade', () => {
    routeIncomingMessage(
      JSON.stringify({
        e: 'aggTrade',
        E: 1710000000000,
        s: 'BTCUSDT',
        p: '84250.55',
        q: '0.125',
        m: false,
      })
    );

    expect(pushTrade).toHaveBeenCalledTimes(1);
    expect(pushPoint).toHaveBeenCalledTimes(1);
  });
});
