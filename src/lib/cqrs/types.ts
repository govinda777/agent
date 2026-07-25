export interface IEvent {
  externalEventId?: string;
  tenantId: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt?: Date;
}

export interface ICommand {
  tenantId: string;
}

export interface ICommandHandler<T extends ICommand> {
  execute(command: T): Promise<string | void>;
}

export interface IQuery<TResult> {
  execute(...args: any[]): Promise<TResult>;
}
