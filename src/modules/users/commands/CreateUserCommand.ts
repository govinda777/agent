import { ICommand } from '@/lib/cqrs/types';

export class CreateUserCommand implements ICommand {
  constructor(
    public readonly tenantId: string, // GLOBAL if not assigned
    public readonly userId: string,
    public readonly privyId: string
  ) {}
}
