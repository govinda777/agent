import { ICommandHandler } from '@/lib/cqrs/types';
import { CreateTenantCommand } from '../commands/CreateTenantCommand';
import { EventStore } from '@/lib/cqrs/EventStore';
import { TENANT_CREATED, TENANT_USER_ASSOCIATED } from '../events/TenantEvents';

export class CreateTenantHandler implements ICommandHandler<CreateTenantCommand> {
  async execute(command: CreateTenantCommand): Promise<string> {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 days trial

    // Emit TenantCreated
    await EventStore.append({
      tenantId: command.tenantId,
      aggregateType: 'TENANT',
      aggregateId: command.tenantId,
      eventType: TENANT_CREATED,
      payload: {
        tenantId: command.tenantId,
        trialEndsAt: trialEndsAt
      }
    });

    // Emit TenantUserAssociated
    await EventStore.append({
      tenantId: command.tenantId,
      aggregateType: 'TENANT',
      aggregateId: command.tenantId,
      eventType: TENANT_USER_ASSOCIATED,
      payload: {
        tenantId: command.tenantId,
        userId: command.userId,
        privyId: command.privyId,
        role: 'OWNER'
      }
    });

    return command.tenantId;
  }
}
