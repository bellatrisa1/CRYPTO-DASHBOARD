import type { OrderBookLevel, OrderBookSnapshot } from '../types/orderBook';
import type { PricePoint } from '../types/market';
import type { Trade } from '../types/trade';
import type {
  BinancePartialDepthMessage,
  BinanceTradeMessage,
} from '../schemas/ws.schema';

function toOrderBookLevels(
  levels: Array<[string, string]>,
  side: 'bid' | 'ask'
): OrderBookLevel[] {
  let cumulative = 0;

  return levels.map(([priceString, amountString]) => {
    const price = Number(priceString);
    const amount = Number(amountString);

    cumulative += amount;

    return {
      price,
      amount: Number(amount.toFixed(6)),
      total: Number(cumulative.toFixed(6)),
      side,
    };
  });
}

export function mapBinanceTradeToTrade(data: BinanceTradeMessage): Trade {
  const price = Number(data.p);
  const amount = Number(data.q);

  return {
    id: crypto.randomUUID(),
    symbol: data.s,
    price,
    amount,
    side: data.m ? 'sell' : 'buy',
    timestamp: data.E,
  };
}

export function mapBinanceTradeToPricePoint(
  data: BinanceTradeMessage
): PricePoint {
  return {
    timestamp: data.E,
    price: Number(data.p),
    volume: Number(data.q),
  };
}

export function mapBinanceDepthToOrderBook(
  data: BinancePartialDepthMessage
): OrderBookSnapshot {
  const bids = toOrderBookLevels(data.bids, 'bid');
  const asks = toOrderBookLevels(data.asks, 'ask');

  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;
  const spread = Number((bestAsk - bestBid).toFixed(2));
  const spreadPercent =
    bestAsk > 0 ? Number(((spread / bestAsk) * 100).toFixed(4)) : 0;

  return {
    bids,
    asks,
    spread,
    spreadPercent,
  };
}
