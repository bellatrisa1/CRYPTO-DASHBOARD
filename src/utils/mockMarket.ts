// src/utils/mockMarket.ts

import type { PricePoint, TradingPair } from '../types/market';

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function getBasePriceBySymbol(symbol: TradingPair) {
  switch (symbol) {
    case 'BTCUSDT':
      return 84200;
    case 'ETHUSDT':
      return 3200;
    case 'SOLUSDT':
      return 185;
    default:
      return 1000;
  }
}

export function generateMockPriceSeries(
  points = 60,
  startPrice = 84200,
): PricePoint[] {
  const now = Date.now();
  const step = 60 * 1000;

  const result: PricePoint[] = [];
  let currentPrice = startPrice;

  for (let index = points - 1; index >= 0; index -= 1) {
    const timestamp = now - index * step;
    const drift = randomInRange(-180, 220);
    currentPrice = Math.max(1, currentPrice + drift);

    result.push({
      timestamp,
      price: Number(currentPrice.toFixed(2)),
      volume: Number(randomInRange(120, 1500).toFixed(2)),
    });
  }

  return result;
}