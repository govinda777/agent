import { ICommand } from '@/lib/cqrs/types';

export class StartCheckoutCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly plan: string
  ) {}
}
