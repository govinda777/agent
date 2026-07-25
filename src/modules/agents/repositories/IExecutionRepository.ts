import { ExecutionProjection } from '@prisma/client';

export interface IExecutionRepository {
  findById(id: string, tenantId: string): Promise<ExecutionProjection | null>;
}
