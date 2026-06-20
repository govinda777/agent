import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getPrismaWithRLS } from '@/lib/prisma';

/**
 * QUERY ROUTE: OBTEM STATUS DA EXECUÇÃO
 *
 * Exemplo de leitura do Read Model (Projeção) otimizado.
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

    const db = getPrismaWithRLS(tenantId);

    // Lê da projeção (rápido, sem replay de eventos)
    const projection = await db.executionProjection.findUnique({
      where: { id: executionId }
    });

    if (!projection) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    return NextResponse.json(projection);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
