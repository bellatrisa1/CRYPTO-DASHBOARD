import { WebSocketServer, WebSocket } from 'ws';
import { connectToBinance } from './wsClient.js';
import { generateTelemetry } from '../telemetry/generator.js';
import type {
  SharedClientToServerEvent,
  SharedServerToClientEvent,
} from '../../../shared/types/ws.js';

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

      const event: SharedServerToClientEvent = {
        type: 'telemetry.snapshot',
        payload: generateTelemetry(),
      };

      client.send(JSON.stringify(event));
    }, 2000);

    function forwardToClient(data: SharedServerToClientEvent) {
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
        const message = JSON.parse(raw.toString()) as SharedClientToServerEvent;

        if (message.type === 'ping') {
          const response: SharedServerToClientEvent = {
            type: 'pong',
            timestamp: message.timestamp,
          };

          client.send(JSON.stringify(response));
          return;
        }

        if (message.type === 'subscribe') {
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
