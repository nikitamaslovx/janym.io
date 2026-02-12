import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { metricsService } from '@/services/metrics/MetricsService';
import type { Timeframe } from '@/services/metrics/types';

export async function GET(request: Request) {
  try {
    const { orgId, userId } = await auth();
    const effectiveOrgId = orgId || userId;

    if (!effectiveOrgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get('timeframe') || '30d') as Timeframe;

    const history = await metricsService.getPortfolioHistory(effectiveOrgId, timeframe);

    // Format for Recharts (e.g., "Jan 01")
    const formattedHistory = history.map(point => ({
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date(point.timestamp)),
      value: point.balanceUsd,
    }));

    return NextResponse.json({ history: formattedHistory });
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
