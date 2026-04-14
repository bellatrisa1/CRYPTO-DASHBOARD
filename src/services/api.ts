import type { TradingPair } from '../types/market';
import type { MarketSnapshot } from '../types/snapshot';
import type { Trade } from '../types/trade';
import {
  generateMockPriceSeries,
  getBasePriceBySymbol,
} from '../utils/mockMarket';
import { generateMockOrderBook } from '../utils/mockOrderBook';

function createMockTrades(symbol: TradingPair, basePrice: number): Trade[] {
  return Array.from({ length: 18 }).map((_, index) => {
    const side: Trade['side'] = index % 2 === 0 ? 'buy' : 'sell';
    const drift = (Math.random() - 0.5) * Math.max(basePrice * 0.0025, 0.5);
    const price = Number((basePrice + drift).toFixed(2));

    return {
      id: `${symbol}-snapshot-trade-${index}`,
      symbol,
      price,
      amount: Number((Math.random() * 1.8 + 0.15).toFixed(3)),
      side,
      timestamp: Date.now() - index * 15_000,
    };
  });
}

export async function fetchMarketSnapshot(
  symbol: TradingPair
): Promise<MarketSnapshot> {
  const basePrice = getBasePriceBySymbol(symbol);
  const points = generateMockPriceSeries(48, basePrice);
  const lastPrice = points[points.length - 1]?.price ?? basePrice;

  return {
    symbol,
    points,
    trades: createMockTrades(symbol, lastPrice),
    orderBook: generateMockOrderBook(lastPrice),
    volume24h: 28_457_321,
    metrics: [
      { label: 'Memory', value: 59, unit: '%' },
      { label: 'CPU', value: 72, unit: '%' },
      { label: 'Network', value: 48, unit: '%' },
    ],
    activity: [
      { region: 'Europe', value: 74 },
      { region: 'North America', value: 62 },
      { region: 'Asia', value: 88 },
      { region: 'South America', value: 41 },
      { region: 'Middle East', value: 35 },
    ],
  };
}
