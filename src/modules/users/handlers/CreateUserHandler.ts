import { ICommandHandler } from '@/lib/cqrs/types';
import { CreateUserCommand } from '../commands/CreateUserCommand';
import { EventStore } from '@/lib/cqrs/EventStore';
import { USER_CREATED } from '../events/UserEvents';

export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  async execute(command: CreateUserCommand): Promise<string> {
    await EventStore.append({
      tenantId: command.tenantId,
      aggregateType: 'USER',
      aggregateId: command.userId,
      eventType: USER_CREATED,
      payload: {
        userId: command.userId,
        privyId: command.privyId,
        timestamp: new Date().toISOString()
      }
    });

    return command.userId;
  }
}
