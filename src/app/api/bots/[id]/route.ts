import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { botService } from '@/services/bot/BotService';

const updateBotSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  strategyType: z
    .enum([
      'pure_market_making',
      'cross_exchange_mining',
      'arbitrage',
      'avellaneda_market_making',
      'perpetual_market_making',
      'spot_perpetual_arbitrage',
      'liquidity_mining',
      'custom',
    ])
    .optional(),
  exchange: z.string().min(1).optional(),
  tradingPair: z.string().min(1).optional(),
  config: z.record(z.unknown()).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const bot = await botService.getBot(id, orgId);

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    return NextResponse.json({ bot });
  } catch (error) {
    console.error('Error fetching bot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateBotSchema.parse(body);

    const bot = await botService.updateBot({
      id,
      organizationId: orgId,
      ...validatedData,
    });

    return NextResponse.json({ bot });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === 'Bot not found or access denied') {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    console.error('Error updating bot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await botService.deleteBot(id, orgId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Bot not found or access denied') {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    console.error('Error deleting bot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
