import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { botsSchema } from '@/models/Schema';
import { candleService } from '@/services/exchange/CandleService';

const candlesParamsSchema = z.object({
  symbol: z.string(),
  interval: z.string().default('1h'),
  limit: z.number().int().min(1).max(1000).default(100),
  since: z.number().optional(),
});

export const POST = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  try {
    const botId = params.id;
    const body = await request.json();
    const validatedParams = candlesParamsSchema.parse(body);

    // Verify bot exists
    const [bot] = await db
      .select()
      .from(botsSchema)
      .where(eq(botsSchema.id, botId))
      .limit(1);

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Trigger candle download
    const candles = await candleService.fetchAndStoreCandles(
      bot.exchange as any,
      validatedParams.symbol || bot.tradingPair,
      validatedParams.interval,
      validatedParams.since,
      validatedParams.limit,
    );

    return NextResponse.json({
      success: true,
      count: candles.length,
      firstTimestamp: candles.length > 0 ? (candles[0]?.timestamp ?? null) : null,
      lastTimestamp: candles.length > 0 ? (candles[candles.length - 1]?.timestamp ?? null) : null,
    });
  } catch (error) {
    console.error('API Error in backtest candles:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

export const GET = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  try {
    const botId = params.id;
    const { searchParams } = new URL(request.url);
    const interval = searchParams.get('interval') || '1h';

    // Verify bot exists
    const [bot] = await db
      .select()
      .from(botsSchema)
      .where(eq(botsSchema.id, botId))
      .limit(1);

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Get count of available candles in DB
    const candles = await candleService.getCandles(
      bot.exchange as any,
      bot.tradingPair,
      interval,
      new Date(0), // All time
      new Date(),
    );

    return NextResponse.json({
      exchange: bot.exchange,
      symbol: bot.tradingPair,
      interval,
      availableCount: candles.length,
      firstTimestamp: candles.length > 0 ? (candles[0]?.timestamp ?? null) : null,
      lastTimestamp: candles.length > 0 ? (candles[candles.length - 1]?.timestamp ?? null) : null,
    });
  } catch (error) {
    console.error('API Error in backtest candles GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
