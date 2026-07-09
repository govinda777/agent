import { ExecutionProjection } from '@prisma/client';
import { getPrismaWithRLS } from '@/lib/prisma';
import { IExecutionRepository } from '../repositories/IExecutionRepository';

export class PrismaExecutionRepository implements IExecutionRepository {
  async findById(id: string, tenantId: string): Promise<ExecutionProjection | null> {
    const db = getPrismaWithRLS(tenantId);
    return db.executionProjection.findUnique({
      where: { id }
    });
  }
}
