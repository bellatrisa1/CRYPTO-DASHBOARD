import {
  binanceCombinedStreamSchema,
  binancePartialDepthSchema,
  binanceTradeSchema,
  wsIncomingMessageSchema,
} from '../schemas/ws.schema';
import type { OrderBookLevel, OrderBookSnapshot } from '../types/orderBook';
import { useMarketStore } from '../store/marketStore';

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

function toOrderBookSnapshot(
  bidsInput: Array<[string, string]>,
  asksInput: Array<[string, string]>
): OrderBookSnapshot {
  const bids = toOrderBookLevels(bidsInput, 'bid');
  const asks = toOrderBookLevels(asksInput, 'ask');

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

export function routeIncomingMessage(raw: string) {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch (error) {
    console.error('Invalid JSON:', error);
    return;
  }

  const combinedResult = binanceCombinedStreamSchema.safeParse(parsedJson);
  const payloadToParse = combinedResult.success
    ? combinedResult.data.data
    : parsedJson;

  const tradeResult = binanceTradeSchema.safeParse(payloadToParse);

  if (tradeResult.success) {
    const data = tradeResult.data;
    const store = useMarketStore.getState();

    const price = Number(data.p);
    const amount = Number(data.q);

    store.pushTrade({
      id: crypto.randomUUID(),
      symbol: data.s,
      price,
      amount,
      side: data.m ? 'sell' : 'buy',
      timestamp: data.E,
    });

    store.pushPoint({
      timestamp: data.E,
      price,
      volume: amount,
    });

    return;
  }

  const depthResult = binancePartialDepthSchema.safeParse(payloadToParse);

  if (depthResult.success) {
    const data = depthResult.data;
    const snapshot = toOrderBookSnapshot(data.bids, data.asks);
    const store = useMarketStore.getState();

    store.setOrderBook(snapshot);
    return;
  }

  const result = wsIncomingMessageSchema.safeParse(payloadToParse);

  if (!result.success) {
    console.error('Unknown WS message:', result.error.flatten());
    return;
  }

  const message = result.data;
  const store = useMarketStore.getState();

  switch (message.type) {
    case 'market_tick':
      store.pushPoint(message.payload);
      return;

    case 'trade':
      store.pushTrade(message.payload);
      return;

    case 'order_book':
      store.setOrderBook(message.payload);
      return;
  }
}
