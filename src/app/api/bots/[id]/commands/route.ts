import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { botService } from '@/services/bot/BotService';

const commandSchema = z.enum(['start', 'stop', 'restart']);

export async function POST(
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
    const { command } = body;

    const validatedCommand = commandSchema.parse(command);

    switch (validatedCommand) {
      case 'start':
        await botService.startBot(id, orgId);
        break;
      case 'stop':
        await botService.stopBot(id, orgId);
        break;
      case 'restart':
        await botService.restartBot(id, orgId);
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Bot ${validatedCommand} command sent`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid command', details: error.errors },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === 'Bot not found or access denied') {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    console.error('Error sending bot command:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
