import { ICommandHandler } from '@/lib/cqrs/types';
import { StartCheckoutCommand } from '../commands/StartCheckoutCommand';
import { ProcessCheckoutUseCase } from '../useCases/ProcessCheckoutUseCase';
import { EventStore } from '@/lib/cqrs/EventStore';
import { CHECKOUT_STARTED } from '../events/CheckoutEvents';

export class StartCheckoutHandler implements ICommandHandler<StartCheckoutCommand> {
  private processCheckoutUseCase = new ProcessCheckoutUseCase();

  async execute(command: StartCheckoutCommand): Promise<string> {
    const productName = "Plano Profissional Agent 2026";
    const amountInCents = 9700; // R$ 97,00

    const { url } = await this.processCheckoutUseCase.execute({
      productName,
      amountInCents,
      tenantId: command.tenantId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${command.tenantId}/checkout/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${command.tenantId}/checkout?canceled=true`,
    });

    if (!url) throw new Error('Failed to generate checkout URL');

    // Architecture Fix: Emit CheckoutStarted event
    await EventStore.append({
      tenantId: command.tenantId,
      aggregateType: 'CHECKOUT',
      aggregateId: command.tenantId, // Using tenantId as aggregateId for checkout flow context
      eventType: CHECKOUT_STARTED,
      payload: {
        tenantId: command.tenantId,
        userId: command.userId,
        plan: command.plan,
        timestamp: new Date().toISOString()
      }
    });

    return url;
  }
}
