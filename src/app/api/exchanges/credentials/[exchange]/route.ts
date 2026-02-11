import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { credentialsService } from '@/services/exchange/CredentialsService';

export async function GET(
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

    // Don't return actual credentials, just indicate they exist
    return NextResponse.json({
      exchange: credentials.exchange,
      isTestnet: credentials.isTestnet,
      exists: true,
    });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ exchange: string }> },
) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { exchange } = await params;
    await credentialsService.deleteCredentials(orgId, exchange);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Credentials not found') {
      return NextResponse.json(
        { error: 'Credentials not found' },
        { status: 404 },
      );
    }

    console.error('Error deleting credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
