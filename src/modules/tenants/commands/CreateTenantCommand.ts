import { ICommand } from '@/lib/cqrs/types';

export class CreateTenantCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly privyId: string
  ) {}
}
