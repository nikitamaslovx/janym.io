import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { metricsService } from '@/services/metrics/MetricsService';

export async function GET() {
  try {
    const { orgId, userId } = await auth();
    const effectiveOrgId = orgId || userId;

    if (!effectiveOrgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolio = await metricsService.getPortfolioValue(effectiveOrgId);

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
