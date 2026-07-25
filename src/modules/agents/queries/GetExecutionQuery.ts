import { IQuery } from '@/lib/cqrs/types';
import { executionRepository } from '../di';
import { ExecutionProjection } from '@prisma/client';

export class GetExecutionQuery implements IQuery<ExecutionProjection | null> {
  async execute(executionId: string, tenantId: string): Promise<ExecutionProjection | null> {
    return executionRepository.findById(executionId, tenantId);
  }
}

export const getExecutionQuery = new GetExecutionQuery();
