import ccxt from 'ccxt';
import { and, asc, eq, gte, lte, sql } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { candlesSchema } from '@/models/Schema';
import type { Exchange } from '@/types/exchange';

export type Candle = {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export class CandleService {
  /**
   * Fetch candles from exchange and store them in DB
   */
  async fetchAndStoreCandles(
    exchangeId: Exchange,
    symbol: string,
    interval: string = '1h',
    since?: number,
    limit: number = 100,
  ): Promise<Candle[]> {
    try {
      // @ts-expect-error - Dynamic access to ccxt exchanges
      const ExchangeClass = ccxt[exchangeId];
      if (!ExchangeClass) {
        throw new Error(`Exchange ${exchangeId} not supported by CCXT`);
      }

      const exchange = new ExchangeClass({ enableRateLimit: true });

      // CCXT expects symbol like BTC/USDT
      const ccxtSymbol = symbol.replace('-', '/');

      const ohlcv = await exchange.fetchOHLCV(ccxtSymbol, interval, since, limit);
      const candles: Candle[] = ohlcv.map((c: any) => ({
        timestamp: new Date(c[0]),
        open: c[1],
        high: c[2],
        low: c[3],
        close: c[4],
        volume: c[5],
      }));

      // Store in DB
      if (candles.length > 0) {
        await db
          .insert(candlesSchema)
          .values(
            candles.map(c => ({
              exchange: exchangeId,
              symbol,
              interval,
              timestamp: c.timestamp,
              open: c.open.toString(),
              high: c.high.toString(),
              low: c.low.toString(),
              close: c.close.toString(),
              volume: c.volume.toString(),
            })),
          )
          .onConflictDoUpdate({
            target: [
              candlesSchema.exchange,
              candlesSchema.symbol,
              candlesSchema.interval,
              candlesSchema.timestamp,
            ],
            set: {
              open: sql`EXCLUDED.open`,
              high: sql`EXCLUDED.high`,
              low: sql`EXCLUDED.low`,
              close: sql`EXCLUDED.close`,
              volume: sql`EXCLUDED.volume`,
            },
          });
      }

      return candles;
    } catch (error) {
      console.error(`CandleService: Error fetching/storing candles:`, error);
      throw error;
    }
  }

  /**
   * Get candles from DB with optional fallback to exchange
   */
  async getCandles(
    exchangeId: Exchange,
    symbol: string,
    interval: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Candle[]> {
    const results = await db
      .select()
      .from(candlesSchema)
      .where(
        and(
          eq(candlesSchema.exchange, exchangeId),
          eq(candlesSchema.symbol, symbol),
          eq(candlesSchema.interval, interval),
          gte(candlesSchema.timestamp, startTime),
          lte(candlesSchema.timestamp, endTime),
        ),
      )
      .orderBy(asc(candlesSchema.timestamp));

    return results.map(r => ({
      timestamp: r.timestamp,
      open: Number.parseFloat(r.open),
      high: Number.parseFloat(r.high),
      low: Number.parseFloat(r.low),
      close: Number.parseFloat(r.close),
      volume: Number.parseFloat(r.volume),
    }));
  }
}

export const candleService = new CandleService();
