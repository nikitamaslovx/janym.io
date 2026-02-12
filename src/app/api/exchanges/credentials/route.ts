import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { credentialsService } from '@/services/exchange/CredentialsService';

const storeCredentialsSchema = z.object({
  exchange: z.string().min(1),
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
  passphrase: z.string().optional(),
  isTestnet: z.boolean().optional(),
});

export async function GET() {
  try {
    const { orgId, userId } = await auth();
    const effectiveOrgId = orgId || userId;

    if (!effectiveOrgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credentials = await credentialsService.listCredentials(effectiveOrgId);

    return NextResponse.json({ credentials });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { orgId, userId } = await auth();
    const effectiveOrgId = orgId || userId;

    if (!effectiveOrgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = storeCredentialsSchema.parse(body);

    // Validate credentials before storing
    const isValid = await credentialsService.validateCredentials(validatedData as any);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 },
      );
    }

    await credentialsService.storeCredentials(
      effectiveOrgId,
      validatedData.exchange,
      validatedData as any,
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Error storing credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
