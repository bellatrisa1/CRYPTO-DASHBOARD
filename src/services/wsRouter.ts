import {
  backendIncomingSchema,
  binanceCombinedStreamSchema,
  binancePartialDepthSchema,
  binanceTradeSchema,
  wsIncomingMessageSchema,
} from '../schemas/ws.schema';
import {
  mapBackendOrderBookToSnapshot,
  mapBackendTelemetry,
  mapBackendTickToPricePoint,
  mapBackendTradeToTrade,
} from '../mappers/backend';
import {
  mapBinanceDepthToOrderBook,
  mapBinanceTradeToPricePoint,
  mapBinanceTradeToTrade,
} from '../mappers/binance';
import { useMarketStore } from '../store/marketStore';

export function routeIncomingMessage(raw: string) {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch (error) {
    console.error('Invalid JSON:', error);
    return;
  }

  const store = useMarketStore.getState();

  const combinedResult = binanceCombinedStreamSchema.safeParse(parsedJson);
  const payloadToParse = combinedResult.success
    ? combinedResult.data.data
    : parsedJson;

  const binanceTradeResult = binanceTradeSchema.safeParse(payloadToParse);

  if (binanceTradeResult.success) {
    store.pushTrade(mapBinanceTradeToTrade(binanceTradeResult.data));
    store.pushPoint(mapBinanceTradeToPricePoint(binanceTradeResult.data));
    return;
  }

  const binanceDepthResult = binancePartialDepthSchema.safeParse(payloadToParse);

  if (binanceDepthResult.success) {
    store.setOrderBook(mapBinanceDepthToOrderBook(binanceDepthResult.data));
    return;
  }

  const backendResult = backendIncomingSchema.safeParse(parsedJson);

  if (backendResult.success) {
    const event = backendResult.data;

    switch (event.type) {
      case 'market.tick':
        store.pushPoint(mapBackendTickToPricePoint(event));
        return;

      case 'market.trade':
        store.pushTrade(mapBackendTradeToTrade(event));
        return;

      case 'market.orderbook':
        store.setOrderBook(mapBackendOrderBookToSnapshot(event));
        return;

      case 'telemetry.snapshot': {
        const snapshot = mapBackendTelemetry(event);
        store.setTelemetrySnapshot(snapshot);
        return;
      }
    }
  }

  const internalResult = wsIncomingMessageSchema.safeParse(payloadToParse);

  if (internalResult.success) {
    const message = internalResult.data;

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

  console.error('Unknown WS message format');
}