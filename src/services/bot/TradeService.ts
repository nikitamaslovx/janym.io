import { desc, eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { tradesSchema } from '@/models/Schema';

export type Trade = {
  id: number;
  market: string;
  symbol: string;
  base: string;
  quote: string;
  orderType: string;
  tradeType: string;
  price: number;
  amount: number;
  timestamp: number;
};

export class TradeService {
  async saveTrade(botId: string, trade: Trade): Promise<void> {
    await db.insert(tradesSchema).values({
      botId,
      market: trade.market,
      symbol: trade.symbol,
      baseAsset: trade.base,
      quoteAsset: trade.quote,
      orderType: trade.orderType,
      tradeType: trade.tradeType,
      price: trade.price.toString(),
      amount: trade.amount.toString(),
      exchangeTimestamp: new Date(trade.timestamp), // Hummingbot uses ms
    });
  }

  async getBotTrades(botId: string, limit: number = 50) {
    return await db
      .select()
      .from(tradesSchema)
      .where(eq(tradesSchema.botId, botId))
      .orderBy(desc(tradesSchema.exchangeTimestamp))
      .limit(limit);
  }
}

export const tradeService = new TradeService();
