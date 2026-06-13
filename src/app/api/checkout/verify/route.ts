import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/modules/auth/server';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2026-05-27.dahlia',
});

export async function POST(request: Request) {
  try {
    const { tenantId } = await requireAuth(request);
    
    const body = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log(`Verify Checkout: Session status is ${session.payment_status}, tenantId is ${tenantId}, client_reference_id is ${session.client_reference_id}`);

    if (session.payment_status === 'paid' && session.client_reference_id === tenantId) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { status: 'ACTIVE' },
      });
      return NextResponse.json({ success: true, status: 'ACTIVE' }, { status: 200 });
    }

    return NextResponse.json({ success: false, status: 'FREE' }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'NOT_PROVISIONED') {
      return NextResponse.json({ error: 'User is not provisioned', code: 'NOT_PROVISIONED' }, { status: 403 });
    }
    console.error('Error verifying checkout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
