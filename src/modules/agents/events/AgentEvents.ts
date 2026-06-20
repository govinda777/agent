import { IEvent } from '@/lib/cqrs/types';

export const AgentCreatedEvent = (tenantId: string, agentId: string, payload: any): IEvent => ({
  tenantId,
  aggregateType: 'AGENT',
  aggregateId: agentId,
  eventType: 'AgentCreated',
  payload,
});

export const AgentExecutionStartedEvent = (tenantId: string, executionId: string, payload: any): IEvent => ({
  tenantId,
  aggregateType: 'EXECUTION',
  aggregateId: executionId,
  eventType: 'AgentExecutionStarted',
  payload,
});
