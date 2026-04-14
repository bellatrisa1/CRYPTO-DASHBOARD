import { create } from 'zustand';
import type { PricePoint, TradingPair } from '../types/market';
import type { OrderBookSnapshot } from '../types/orderBook';
import type { Trade } from '../types/trade';
import type { StreamStatus } from '../types/ws';
import type { RegionActivity, SystemMetric } from '../types/telemetry';
import {
  generateMockPriceSeries,
  getBasePriceBySymbol,
} from '../utils/mockMarket';
import { generateMockOrderBook } from '../utils/mockOrderBook';

type TelemetrySnapshot = {
  metrics: SystemMetric[];
  activity: RegionActivity[];
};

type MarketSnapshot = {
  symbol: TradingPair;
  points: PricePoint[];
  trades: Trade[];
  orderBook: OrderBookSnapshot;
  volume24h: number;
  metrics: SystemMetric[];
  activity: RegionActivity[];
};

type MarketState = {
  symbol: TradingPair;
  points: PricePoint[];
  trades: Trade[];
  orderBook: OrderBookSnapshot;
  lastPrice: number;
  changePercent: number;
  volume24h: number;

  streamStatus: StreamStatus;
  isConnected: boolean;
  reconnectAttempt: number;
  nextReconnectInMs: number | null;
  latencyMs: number | null;

  telemetry: {
    volumeSeries: PricePoint[];
    serverLoadSeries: PricePoint[];
    networkSeries: PricePoint[];
    metrics: SystemMetric[];
    activity: RegionActivity[];
  };

  pushPoint: (point: PricePoint) => void;
  pushTrade: (trade: Trade) => void;
  updateOrderBook: (basePrice: number) => void;
  setOrderBook: (snapshot: OrderBookSnapshot) => void;

  setStreamStatus: (status: StreamStatus) => void;
  setReconnectMeta: (attempt: number, delayMs: number | null) => void;
  resetReconnectMeta: () => void;
  setSymbol: (symbol: TradingPair) => void;
  setLatency: (value: number | null) => void;

  updateTelemetry: () => void;
  setTelemetrySnapshot: (payload: TelemetrySnapshot) => void;
  setSnapshot: (snapshot: MarketSnapshot) => void;
};

const CHART_POINTS_LIMIT = 48;
const TELEMETRY_SERIES_LIMIT = 30;
const MAX_TRADES = 2000;
const DEFAULT_VOLUME_24H = 28_457_321;

const initialSymbol: TradingPair = 'BTCUSDT';
const initialBasePrice = getBasePriceBySymbol(initialSymbol);
const initialPoints = generateMockPriceSeries(
  CHART_POINTS_LIMIT,
  initialBasePrice,
);
const firstPrice = initialPoints[0]?.price ?? 0;
const lastPrice = initialPoints[initialPoints.length - 1]?.price ?? 0;

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createInitialTrades(symbol: TradingPair, basePrice: number): Trade[] {
  return Array.from({ length: 18 }).map((_, index) => {
    const side: Trade['side'] = index % 2 === 0 ? 'buy' : 'sell';
    const drift = (Math.random() - 0.5) * Math.max(basePrice * 0.0025, 0.5);
    const price = Number((basePrice + drift).toFixed(2));

    return {
      id: `${symbol}-initial-trade-${index}`,
      symbol,
      price,
      amount: Number((Math.random() * 1.8 + 0.15).toFixed(3)),
      side,
      timestamp: Date.now() - index * 15_000,
    };
  });
}

function createMiniPoint(base: number, volatility = 0.1): PricePoint {
  return {
    timestamp: Date.now(),
    price: Number(
      (base + (Math.random() - 0.5) * base * volatility).toFixed(2),
    ),
    volume: 0,
  };
}

function createInitialMiniSeries(
  points: number,
  base: number,
  volatility = 0.1,
): PricePoint[] {
  return Array.from({ length: points }).map((_, index) => ({
    timestamp: Date.now() - (points - index) * 1000,
    price: Number(
      (base + (Math.random() - 0.5) * base * volatility).toFixed(2),
    ),
    volume: 0,
  }));
}

function createInitialMetrics(): SystemMetric[] {
  return [
    { label: 'Memory', value: 59, unit: '%' },
    { label: 'CPU', value: 72, unit: '%' },
    { label: 'Network', value: 48, unit: '%' },
  ];
}

function createInitialActivity(): RegionActivity[] {
  return [
    { region: 'Europe', value: 74 },
    { region: 'North America', value: 62 },
    { region: 'Asia', value: 88 },
    { region: 'South America', value: 41 },
    { region: 'Middle East', value: 35 },
  ];
}

function createInitialTelemetry() {
  return {
    volumeSeries: createInitialMiniSeries(TELEMETRY_SERIES_LIMIT, 2000, 0.15),
    serverLoadSeries: createInitialMiniSeries(
      TELEMETRY_SERIES_LIMIT,
      60,
      0.08,
    ),
    networkSeries: createInitialMiniSeries(TELEMETRY_SERIES_LIMIT, 120, 0.12),
    metrics: createInitialMetrics(),
    activity: createInitialActivity(),
  };
}

function updateMetricValue(label: string, currentValue: number): number {
  switch (label) {
    case 'Memory':
      return clamp(currentValue + randomInRange(-3, 3), 35, 92);
    case 'CPU':
      return clamp(currentValue + randomInRange(-6, 6), 18, 98);
    case 'Network':
      return clamp(currentValue + randomInRange(-5, 5), 20, 95);
    default:
      return currentValue;
  }
}

function updateActivityValue(currentValue: number): number {
  return clamp(currentValue + randomInRange(-8, 8), 12, 100);
}

export const useMarketStore = create<MarketState>((set) => ({
  symbol: initialSymbol,
  points: initialPoints,
  trades: createInitialTrades(initialSymbol, lastPrice),
  orderBook: generateMockOrderBook(lastPrice),
  lastPrice,
  changePercent: firstPrice
    ? Number((((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2))
    : 0,
  volume24h: DEFAULT_VOLUME_24H,

  streamStatus: 'open',
  isConnected: true,
  reconnectAttempt: 0,
  nextReconnectInMs: null,
  latencyMs: null,

  telemetry: createInitialTelemetry(),

  pushPoint: (point) =>
    set((state) => {
      const nextPoints = [...state.points, point].slice(-CHART_POINTS_LIMIT);
      const nextFirstPrice = nextPoints[0]?.price ?? point.price;
      const nextLastPrice =
        nextPoints[nextPoints.length - 1]?.price ?? point.price;
      const nextChangePercent = Number(
        (((nextLastPrice - nextFirstPrice) / nextFirstPrice) * 100).toFixed(2),
      );

      return {
        points: nextPoints,
        lastPrice: nextLastPrice,
        changePercent: nextChangePercent,
        volume24h: Number((state.volume24h + point.volume * 120).toFixed(2)),
      };
    }),

  pushTrade: (trade) =>
    set((state) => ({
      trades: [trade, ...state.trades].slice(0, MAX_TRADES),
    })),

  updateOrderBook: (basePrice) =>
    set({
      orderBook: generateMockOrderBook(basePrice),
    }),

  setOrderBook: (snapshot) =>
    set({
      orderBook: snapshot,
    }),

  setStreamStatus: (status) =>
    set({
      streamStatus: status,
      isConnected: status === 'open',
    }),

  setReconnectMeta: (attempt, delayMs) =>
    set({
      reconnectAttempt: attempt,
      nextReconnectInMs: delayMs,
    }),

  resetReconnectMeta: () =>
    set({
      reconnectAttempt: 0,
      nextReconnectInMs: null,
    }),

  setSymbol: (symbol) =>
    set(() => {
      const basePrice = getBasePriceBySymbol(symbol);
      const nextPoints = generateMockPriceSeries(CHART_POINTS_LIMIT, basePrice);
      const nextFirstPrice = nextPoints[0]?.price ?? basePrice;
      const nextLastPrice =
        nextPoints[nextPoints.length - 1]?.price ?? basePrice;

      return {
        symbol,
        points: nextPoints,
        trades: createInitialTrades(symbol, nextLastPrice),
        orderBook: generateMockOrderBook(nextLastPrice),
        lastPrice: nextLastPrice,
        changePercent: nextFirstPrice
          ? Number(
              (((nextLastPrice - nextFirstPrice) / nextFirstPrice) * 100).toFixed(
                2,
              ),
            )
          : 0,
        volume24h: DEFAULT_VOLUME_24H,
        streamStatus: 'connecting',
        isConnected: false,
        reconnectAttempt: 0,
        nextReconnectInMs: null,
        latencyMs: null,
        telemetry: createInitialTelemetry(),
      };
    }),

  setLatency: (value) =>
    set({
      latencyMs: value,
    }),

  updateTelemetry: () =>
    set((state) => ({
      telemetry: {
        volumeSeries: [
          ...state.telemetry.volumeSeries.slice(1),
          createMiniPoint(2000, 0.15),
        ],
        serverLoadSeries: [
          ...state.telemetry.serverLoadSeries.slice(1),
          createMiniPoint(60, 0.08),
        ],
        networkSeries: [
          ...state.telemetry.networkSeries.slice(1),
          createMiniPoint(120, 0.12),
        ],
        metrics: state.telemetry.metrics.map((metric) => ({
          ...metric,
          value: Number(updateMetricValue(metric.label, metric.value).toFixed(0)),
        })),
        activity: state.telemetry.activity.map((item) => ({
          ...item,
          value: Number(updateActivityValue(item.value).toFixed(0)),
        })),
      },
    })),

  setTelemetrySnapshot: (payload) =>
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        metrics: payload.metrics,
        activity: payload.activity,
      },
    })),

  setSnapshot: (snapshot) =>
    set((state) => {
      const firstPointPrice = snapshot.points[0]?.price ?? 0;
      const lastPointPrice =
        snapshot.points[snapshot.points.length - 1]?.price ?? 0;

      return {
        symbol: snapshot.symbol,
        points: snapshot.points,
        trades: snapshot.trades,
        orderBook: snapshot.orderBook,
        lastPrice: lastPointPrice,
        changePercent: firstPointPrice
          ? Number(
              (((lastPointPrice - firstPointPrice) / firstPointPrice) * 100).toFixed(
                2,
              ),
            )
          : 0,
        volume24h: snapshot.volume24h,
        telemetry: {
          ...state.telemetry,
          metrics: snapshot.metrics,
          activity: snapshot.activity,
        },
      };
    }),
}));