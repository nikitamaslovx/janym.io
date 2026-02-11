import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { botService } from '@/services/bot/BotService';

const createBotSchema = z.object({
  name: z.string().min(1).max(255),
  strategyType: z.enum([
    'pure_market_making',
    'cross_exchange_mining',
    'arbitrage',
    'avellaneda_market_making',
    'perpetual_market_making',
    'spot_perpetual_arbitrage',
    'liquidity_mining',
    'custom',
  ]),
  exchange: z.string().min(1),
  tradingPair: z.string().min(1),
  config: z.record(z.unknown()),
});

export async function GET() {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bots = await botService.listBots(orgId);

    return NextResponse.json({ bots });
  } catch (error) {
    console.error('Error fetching bots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBotSchema.parse(body);

    const bot = await botService.createBot({
      ...validatedData,
      organizationId: orgId,
    });

    return NextResponse.json({ bot }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Error creating bot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
