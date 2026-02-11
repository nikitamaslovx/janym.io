import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { botService } from '@/services/bot/BotService';
import { metricsService } from '@/services/metrics/MetricsService';
import type { Timeframe } from '@/types/metrics';

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
    const timeframe = (searchParams.get('timeframe') || '1d') as Timeframe;

    // Verify bot belongs to organization
    const bot = await botService.getBot(id, orgId);
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    const historicalMetrics = await metricsService.getHistoricalMetrics(id, timeframe);
    const latestMetrics = await metricsService.getLatestMetrics(id);
    const pnl = await metricsService.calculatePnL(id, 30);

    return NextResponse.json({
      historical: historicalMetrics,
      latest: latestMetrics,
      pnl,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
