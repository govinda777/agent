import { NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/server';
import { tenantRepository } from '@/modules/tenants/di';

export async function GET(request: Request) {
  try {
    const { tenantId } = await requireAuth(request);

    const tenant = await tenantRepository.findById(tenantId);

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
