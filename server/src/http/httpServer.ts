import cors from 'cors';
import express from 'express';
import { createMarketSnapshot } from '../services/snapshot.service.js';

export function startHttpServer(port: number): void {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/market/snapshot', (req, res) => {
    const symbol =
      typeof req.query.symbol === 'string' && req.query.symbol.trim()
        ? req.query.symbol.trim().toUpperCase()
        : 'BTCUSDT';

    const snapshot = createMarketSnapshot(symbol);
    res.json(snapshot);
  });

  app.listen(port, () => {
    console.log(`HTTP server running on http://localhost:${port}`);
  });
}
