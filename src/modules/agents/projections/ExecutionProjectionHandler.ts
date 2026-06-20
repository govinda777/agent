import { eventBus } from '@/lib/cqrs/EventBus';
import { getPrismaWithRLS } from '@/lib/prisma';
import { IEvent } from '@/lib/cqrs/types';

/**
 * Escuta eventos de execução e atualiza a tabela de projeção (Read Model).
 */
export const initExecutionProjections = () => {

  eventBus.subscribe('AgentExecutionRequested', async (event: IEvent) => {
    const db = getPrismaWithRLS(event.tenantId);
    const agentId = event.payload.agentId as string;

    await db.executionProjection.upsert({
      where: { id: event.aggregateId },
      create: {
        id: event.aggregateId,
        tenantId: event.tenantId,
        agentId: agentId,
        status: 'PENDING',
        startedAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        status: 'PENDING',
        updatedAt: new Date(),
      }
    });
  });

  eventBus.subscribe('ToolExecutionStarted', async (event: IEvent) => {
    const db = getPrismaWithRLS(event.tenantId);
    const toolName = event.payload.toolName as string;
    await db.executionProjection.update({
      where: { id: event.aggregateId },
      data: {
        status: 'RUNNING',
        currentStep: toolName,
        updatedAt: new Date(),
      }
    });
  });
};
