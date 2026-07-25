import { NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/server';
import { getTenantQuery } from '@/modules/tenants/queries/GetTenantQuery';

export async function GET(request: Request) {
  try {
    const { tenantId } = await requireAuth(request);

    // Architecture Fix: Use Query layer
    const tenant = await getTenantQuery.execute(tenantId);

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({
        id: tenant.id,
        status: tenant.status,
        trialEndsAt: tenant.trialEndsAt
    });
  } catch (error: any) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
