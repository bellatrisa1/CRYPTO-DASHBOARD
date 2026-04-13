import { create } from 'zustand';
import type { PricePoint, TradingPair } from '../types/market';
import type { OrderBookSnapshot } from '../types/orderBook';
import type { Trade } from '../types/trade';
import type { StreamStatus } from '../types/ws';
import {
  generateMockPriceSeries,
  getBasePriceBySymbol,
} from '../utils/mockMarket';
import { generateMockOrderBook } from '../utils/mockOrderBook';

type MarketState = {
  symbol: TradingPair;
  points: PricePoint[];
  trades: Trade[];
  orderBook: OrderBookSnapshot;
  lastPrice: number;
  changePercent: number;
  volume24h: number;
  isConnected: boolean;
  streamStatus: StreamStatus;
  reconnectAttempt: number;
  nextReconnectInMs: number | null;
  miniVolume: PricePoint[];
  miniServerLoad: PricePoint[];
  miniNetwork: PricePoint[];
  pushPoint: (point: PricePoint) => void;
  pushTrade: (trade: Trade) => void;
  updateOrderBook: (basePrice: number) => void;
  setOrderBook: (snapshot: OrderBookSnapshot) => void;
  setConnectionStatus: (status: boolean) => void;
  setStreamStatus: (status: StreamStatus) => void;
  setReconnectMeta: (attempt: number, delayMs: number | null) => void;
  resetReconnectMeta: () => void;
  setSymbol: (symbol: TradingPair) => void;
  updateMiniCharts: () => void;
};

const initialSymbol: TradingPair = 'BTCUSDT';
const initialBasePrice = getBasePriceBySymbol(initialSymbol);
const initialPoints = generateMockPriceSeries(48, initialBasePrice);
const firstPrice = initialPoints[0]?.price ?? 0;
const lastPrice = initialPoints[initialPoints.length - 1]?.price ?? 0;

function createInitialTrades(symbol: TradingPair, basePrice: number): Trade[] {
  return Array.from({ length: 18 }).map((_, index) => {
    const side = index % 2 === 0 ? 'buy' : 'sell';
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

function createMiniPoint(base: number): PricePoint {
  return {
    timestamp: Date.now(),
    price: Number((base + (Math.random() - 0.5) * base * 0.1).toFixed(2)),
    volume: 0,
  };
}

function createInitialMiniSeries(points: number, base: number): PricePoint[] {
  return Array.from({ length: points }).map((_, index) => ({
    timestamp: Date.now() - (points - index) * 1000,
    price: Number((base + (Math.random() - 0.5) * base * 0.1).toFixed(2)),
    volume: 0,
  }));
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
  volume24h: 28457321,
  isConnected: true,
  streamStatus: 'open',
  reconnectAttempt: 0,
  nextReconnectInMs: null,
  miniVolume: createInitialMiniSeries(30, 2000),
  miniServerLoad: createInitialMiniSeries(30, 60),
  miniNetwork: createInitialMiniSeries(30, 120),

  pushPoint: (point) =>
    set((state) => {
      const nextPoints = [...state.points, point].slice(-48);
      const nextFirstPrice = nextPoints[0]?.price ?? point.price;
      const nextLastPrice =
        nextPoints[nextPoints.length - 1]?.price ?? point.price;
      const nextChangePercent = Number(
        (((nextLastPrice - nextFirstPrice) / nextFirstPrice) * 100).toFixed(2)
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
      trades: [trade, ...state.trades].slice(0, 2000),
    })),

  updateOrderBook: (basePrice) =>
    set({
      orderBook: generateMockOrderBook(basePrice),
    }),

  setOrderBook: (snapshot) =>
    set({
      orderBook: snapshot,
    }),

  setConnectionStatus: (status) =>
    set({
      isConnected: status,
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
      const nextPoints = generateMockPriceSeries(48, basePrice);
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
              (
                ((nextLastPrice - nextFirstPrice) / nextFirstPrice) *
                100
              ).toFixed(2)
            )
          : 0,
        volume24h: 28457321,
        isConnected: false,
        streamStatus: 'connecting',
        reconnectAttempt: 0,
        nextReconnectInMs: null,
        miniVolume: createInitialMiniSeries(30, 2000),
        miniServerLoad: createInitialMiniSeries(30, 60),
        miniNetwork: createInitialMiniSeries(30, 120),
      };
    }),

  updateMiniCharts: () =>
    set((state) => ({
      miniVolume: [...state.miniVolume.slice(1), createMiniPoint(2000)],
      miniServerLoad: [...state.miniServerLoad.slice(1), createMiniPoint(60)],
      miniNetwork: [...state.miniNetwork.slice(1), createMiniPoint(120)],
    })),
}));
