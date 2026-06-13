import Stripe from 'stripe';
import { env } from '@/config/env';

export interface CheckoutDTO {
  productName: string;
  amountInCents: number;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  tenantId: string;
}

export class ProcessCheckoutUseCase {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.stripeSecretKey, {
      apiVersion: '2026-05-27.dahlia',
    });
  }

  async execute(data: CheckoutDTO): Promise<{ url: string | null }> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: data.productName,
              },
              unit_amount: data.amountInCents,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${data.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: data.cancelUrl,
        customer_email: data.customerEmail,
        client_reference_id: data.tenantId,
      });

      return { url: session.url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }
}
