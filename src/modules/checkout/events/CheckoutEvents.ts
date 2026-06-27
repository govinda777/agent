import { IEvent } from '@/lib/cqrs/types';

export const CHECKOUT_STARTED = 'CheckoutStarted';
export const CHECKOUT_COMPLETED = 'CheckoutCompleted';

export interface CheckoutStartedEvent extends IEvent {
  eventType: typeof CHECKOUT_STARTED;
  payload: {
    tenantId: string;
    userId: string;
    stripeSessionId: string;
    plan: string;
  };
}

export interface CheckoutCompletedEvent extends IEvent {
  eventType: typeof CHECKOUT_COMPLETED;
  payload: {
    tenantId: string;
    userId: string;
    stripeSessionId: string;
    externalEventId: string;
    plan: string;
  };
}
