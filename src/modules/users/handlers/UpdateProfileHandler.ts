import { ICommandHandler } from '@/lib/cqrs/types';
import { UpdateProfileCommand } from '../commands/UpdateProfileCommand';
import { EventStore } from '@/lib/cqrs/EventStore';
import { USER_PROFILE_UPDATED } from '../events/UserEvents';

export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  async execute(command: UpdateProfileCommand): Promise<void> {
    await EventStore.append({
      tenantId: command.tenantId,
      aggregateType: 'USER',
      aggregateId: command.userId,
      eventType: USER_PROFILE_UPDATED,
      payload: {
        ...command,
        timestamp: new Date().toISOString()
      }
    });
  }
}
