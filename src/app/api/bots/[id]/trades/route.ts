import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { botService } from '@/services/bot/BotService';
import { tradeService } from '@/services/bot/TradeService';

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
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);

    // Verify bot belongs to organization
    const bot = await botService.getBot(id, orgId);
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    const trades = await tradeService.getBotTrades(id, limit);

    return NextResponse.json({
      trades,
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
