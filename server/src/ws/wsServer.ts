import { WebSocketServer, WebSocket } from 'ws';
import { connectToBinance } from './wsClient.js';
import { generateTelemetry } from '../telemetry/generator.js';

type ClientMessage =
  | {
      type: 'ping';
      timestamp: number;
    }
  | {
      type: 'subscribe';
      symbol: string;
    };

const DEFAULT_SYMBOL = 'BTCUSDT';

export function startWsServer(port: number): void {
  const wss = new WebSocketServer({ port });

  console.log(`WS server running on ws://localhost:${port}`);

  wss.on('connection', (client: WebSocket) => {
    console.log('Frontend client connected');

    let activeSymbol = DEFAULT_SYMBOL;
    let binance = connectToBinance(activeSymbol, forwardToClient);

    const telemetryInterval = setInterval(() => {
      if (client.readyState !== WebSocket.OPEN) return;

      client.send(
        JSON.stringify({
          type: 'telemetry.snapshot',
          payload: generateTelemetry(),
        }),
      );
    }, 2000);

    function forwardToClient(data: unknown) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    }

    function replaceBinanceConnection(nextSymbol: string) {
      const normalized = nextSymbol.trim().toUpperCase();

      if (!normalized || normalized === activeSymbol) return;

      console.log(`Switching Binance stream: ${activeSymbol} -> ${normalized}`);

      binance.close();
      activeSymbol = normalized;
      binance = connectToBinance(activeSymbol, forwardToClient);
    }

    function cleanup() {
      clearInterval(telemetryInterval);
      binance.close();
    }

    client.on('message', (raw) => {
      try {
        const message = JSON.parse(raw.toString()) as Partial<ClientMessage>;

        if (message.type === 'ping' && typeof message.timestamp === 'number') {
          client.send(
            JSON.stringify({
              type: 'pong',
              timestamp: message.timestamp,
            }),
          );
          return;
        }

        if (message.type === 'subscribe' && typeof message.symbol === 'string') {
          replaceBinanceConnection(message.symbol);
        }
      } catch (error) {
        console.error('Invalid client message:', error);
      }
    });

    client.on('close', () => {
      console.log('Frontend client disconnected');
      cleanup();
    });

    client.on('error', (error) => {
      console.error('Frontend client error:', error);
      cleanup();
    });
  });
}