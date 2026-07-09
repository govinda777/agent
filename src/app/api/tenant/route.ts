import { NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/server';

export async function GET(request: Request) {
  try {
    const { tenantId, db } = await requireAuth(request);

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        status: true,
        trialEndsAt: true,
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch (error: any) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
