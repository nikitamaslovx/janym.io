import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { botService } from '@/services/bot/BotService';

const backtestSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  config: z.record(z.unknown()).optional(),
});

export const POST = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  const { userId, orgId } = await auth();
  const effectiveOrgId = orgId || userId;

  if (!effectiveOrgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = backtestSchema.parse(body);

    const result = await botService.runBacktest(
      params.id,
      effectiveOrgId,
      validated.startDate,
      validated.endDate,
      validated.config,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error in backtest POST:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
};
