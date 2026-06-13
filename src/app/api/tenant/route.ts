import { NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { tenantId } = await requireAuth(request);

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        status: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({ status: tenant.status }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'NOT_PROVISIONED') {
      return NextResponse.json({ error: 'User is not provisioned', code: 'NOT_PROVISIONED' }, { status: 403 });
    }
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
