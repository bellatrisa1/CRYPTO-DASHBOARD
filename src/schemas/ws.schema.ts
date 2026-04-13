import { z } from 'zod';

/* =========================
   BASE SCHEMAS
========================= */

export const pricePointSchema = z.object({
  timestamp: z.number(),
  price: z.number(),
  volume: z.number(),
});

export const tradeSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  price: z.number(),
  amount: z.number(),
  side: z.enum(['buy', 'sell']),
  timestamp: z.number(),
});

export const orderBookLevelSchema = z.object({
  price: z.number(),
  amount: z.number(),
  total: z.number(),
  side: z.enum(['bid', 'ask']),
});

export const orderBookSnapshotSchema = z.object({
  bids: z.array(orderBookLevelSchema),
  asks: z.array(orderBookLevelSchema),
  spread: z.number(),
  spreadPercent: z.number(),
});

/* =========================
   INTERNAL (MOCK / APP) MESSAGES
========================= */

export const marketTickMessageSchema = z.object({
  type: z.literal('market_tick'),
  payload: pricePointSchema,
});

export const tradeMessageSchema = z.object({
  type: z.literal('trade'),
  payload: tradeSchema,
});

export const orderBookMessageSchema = z.object({
  type: z.literal('order_book'),
  payload: orderBookSnapshotSchema,
});

/* =========================
   BINANCE REAL WS SCHEMAS
========================= */

export const binanceTradeSchema = z.object({
  e: z.literal('aggTrade'),
  E: z.number(),
  s: z.string(),
  p: z.string(),
  q: z.string(),
  m: z.boolean(),
});

export const binancePartialDepthSchema = z.object({
  lastUpdateId: z.number(),
  bids: z.array(z.tuple([z.string(), z.string()])),
  asks: z.array(z.tuple([z.string(), z.string()])),
});

export const binanceCombinedStreamSchema = z.object({
  stream: z.string(),
  data: z.unknown(),
});

/* =========================
   UNION (INTERNAL ONLY)
========================= */

export const wsIncomingMessageSchema = z.discriminatedUnion('type', [
  marketTickMessageSchema,
  tradeMessageSchema,
  orderBookMessageSchema,
]);

/* =========================
   TYPES
========================= */

export type WsIncomingMessageSchema = z.infer<typeof wsIncomingMessageSchema>;
export type BinanceTradeMessage = z.infer<typeof binanceTradeSchema>;
export type BinancePartialDepthMessage = z.infer<
  typeof binancePartialDepthSchema
>;
export type BinanceCombinedStreamMessage = z.infer<
  typeof binanceCombinedStreamSchema
>;
