import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { credentialsService } from '@/services/exchange/CredentialsService';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ exchange: string }> },
) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { exchange } = await params;
    const credentials = await credentialsService.getCredentials(orgId, exchange);

    if (!credentials) {
      return NextResponse.json(
        { error: 'Credentials not found' },
        { status: 404 },
      );
    }

    const isValid = await credentialsService.validateCredentials(credentials);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Error validating credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
