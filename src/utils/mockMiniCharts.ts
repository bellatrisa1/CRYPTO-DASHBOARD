import type { PricePoint } from '../types/market';

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function generateMiniSeries(points = 30, base = 100): PricePoint[] {
  const now = Date.now();

  return Array.from({ length: points }).map((_, i) => ({
    timestamp: now - (points - i) * 1000,
    price: Number((base + random(-10, 10)).toFixed(2)),
    volume: Number(random(10, 100)),
  }));
}
