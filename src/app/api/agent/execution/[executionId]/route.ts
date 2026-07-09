import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { executionRepository } from '@/modules/agents/di';

/**
 * QUERY ROUTE: OBTEM STATUS DA EXECUÇÃO
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ executionId: string }> }
) {
  try {
    const { executionId } = await params;
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Architecture Fix: Use Repository instead of direct Prisma/RLS logic here
    const projection = await executionRepository.findById(executionId, tenantId);

    if (!projection) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    return NextResponse.json(projection);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
