import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2026-05-27.dahlia',
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // The client_reference_id contains the tenantId
    const tenantId = session.client_reference_id;

    if (tenantId) {
      try {
        await prisma.tenant.update({
          where: { id: tenantId },
          data: { status: 'ACTIVE' },
        });
        console.log(`Tenant ${tenantId} updated to ACTIVE`);
      } catch (dbError) {
        console.error('Error updating tenant status:', dbError);
        return new NextResponse('Error updating database', { status: 500 });
      }
    } else {
      console.warn('Checkout session completed, but no client_reference_id (tenantId) was provided.');
    }
  }

  return new NextResponse('Webhook processed successfully', { status: 200 });
}
