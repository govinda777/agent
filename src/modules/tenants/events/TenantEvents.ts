import { IEvent } from '@/lib/cqrs/types';

export const TENANT_CREATED = 'TenantCreated';
export const TENANT_USER_ASSOCIATED = 'TenantUserAssociated';

export interface TenantCreatedEvent extends IEvent {
  eventType: typeof TENANT_CREATED;
  payload: {
    tenantId: string;
    trialEndsAt: Date;
  };
}

export interface TenantUserAssociatedEvent extends IEvent {
  eventType: typeof TENANT_USER_ASSOCIATED;
  payload: {
    tenantId: string;
    userId: string;
    privyId: string;
    role: string;
  };
}
