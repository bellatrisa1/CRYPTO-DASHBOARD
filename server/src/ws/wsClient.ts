import WebSocket, { RawData } from 'ws';
import { mapBinanceTradeToFrontend } from '../mappers/binance.mapper.js';
import { mapBinanceDepthToOrderBook } from '../mappers/orderbook.mapper.js';

type BinanceTradeMessage = {
  e: 'trade';
  E: number;
  s: string;
  t: number;
  p: string;
  q: string;
  b: number;
  a: number;
  T: number;
  m: boolean;
  M: boolean;
};

type BinanceDepthMessage = {
  bids: [string, string][];
  asks: [string, string][];
};

type FrontendEvent =
  | {
      type: 'trade';
      payload: ReturnType<typeof mapBinanceTradeToFrontend>;
    }
  | {
      type: 'order_book';
      payload: ReturnType<typeof mapBinanceDepthToOrderBook>;
    };

type BinanceStreamController = {
  close: () => void;
  getReadyState: () => number | null;
};

function buildBinanceStreamUrl(symbol: string): string {
  const normalized = symbol.toLowerCase();

  return `wss://stream.binance.com:9443/stream?streams=${normalized}@trade/${normalized}@depth20@100ms`;
}

export function connectToBinance(
  symbol: string,
  onMessage: (data: FrontendEvent) => void,
): BinanceStreamController {
  let ws: WebSocket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let manuallyClosed = false;
  let reconnectAttempts = 0;

  const maxReconnectAttempts = 10;
  const reconnectBaseDelayMs = 1_000;
  const reconnectMaxDelayMs = 15_000;

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const scheduleReconnect = () => {
    if (manuallyClosed) return;
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error(`Binance reconnect limit reached for ${symbol}`);
      return;
    }

    reconnectAttempts += 1;

    const delay = Math.min(
      reconnectBaseDelayMs * 2 ** (reconnectAttempts - 1),
      reconnectMaxDelayMs,
    );

    console.log(
      `Reconnecting to Binance ${symbol} in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`,
    );

    clearReconnectTimer();

    reconnectTimer = setTimeout(() => {
      connect();
    }, delay);
  };

  const connect = () => {
    clearReconnectTimer();

    ws = new WebSocket(buildBinanceStreamUrl(symbol));

    ws.on('open', () => {
      reconnectAttempts = 0;
      console.log(`Connected to Binance for ${symbol}`);
    });

    ws.on('message', (msg: RawData) => {
      try {
        const parsed = JSON.parse(msg.toString()) as {
          data?: unknown;
        };

        const data = parsed.data;

        if (!data || typeof data !== 'object') return;

        if ('e' in data && data.e === 'trade') {
          onMessage({
            type: 'trade',
            payload: mapBinanceTradeToFrontend(data as BinanceTradeMessage),
          });
          return;
        }

        if ('bids' in data && 'asks' in data) {
          onMessage({
            type: 'order_book',
            payload: mapBinanceDepthToOrderBook(data as BinanceDepthMessage),
          });
        }
      } catch (error) {
        console.error(`WS parse error for ${symbol}:`, error);
      }
    });

    ws.on('close', () => {
      console.log(`Disconnected from Binance for ${symbol}`);
      ws = null;
      scheduleReconnect();
    });

    ws.on('error', (error) => {
      console.error(`Binance WS error for ${symbol}:`, error);
    });
  };

  connect();

  return {
    close: () => {
      manuallyClosed = true;
      clearReconnectTimer();

      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        ws.close();
      }

      ws = null;
    },
    getReadyState: () => ws?.readyState ?? null,
  };
}