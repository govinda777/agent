import { NextResponse } from 'next/server';
import { ProcessCheckoutUseCase } from '@/modules/checkout/useCases/ProcessCheckoutUseCase';
import { requireAuth } from '@/modules/auth/server';
import { env } from '@/config/env';

export async function POST(request: Request) {
  try {
    const processCheckoutUseCase = new ProcessCheckoutUseCase();
    const body = await request.json();
    
    // Check if auth header is present
    const authHeader = request.headers.get('authorization');
    let tenantId;

    // Check for auth if available, and if no auth available and it is a subscription then we will get a 401
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const authResult = await requireAuth(request);
        tenantId = authResult.tenantId;
      } catch (e: any) {
        console.error('requireAuth failed:', e.message);
      }
    }

    if (!body.priceId && (!body.productName || !body.amountInCents)) {
      return NextResponse.json({ error: 'Missing priceId or productName and amountInCents' }, { status: 400 });
    }

    const { productName, amountInCents, priceId } = body;

    // Determine mode based on priceId or explicit mode in body
    let mode: 'payment' | 'subscription' = 'subscription';
    if (priceId === env.stripeConsultingPriceId) {
      mode = 'payment';
    } else if (body.mode === 'payment') {
      mode = 'payment';
    }

    // For subscriptions, tenantId is required
    if (mode === 'subscription' && !tenantId) {
      return NextResponse.json({ error: 'Authentication required for subscription' }, { status: 401 });
    }
    
    const host = request.headers.get('host');
    const protocol = env.nodeEnv === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const { url } = await processCheckoutUseCase.execute({
      productName,
      amountInCents,
      priceId,
      mode,
      tenantId,
      successUrl: `${baseUrl}/onboarding?success=true`,
      cancelUrl: `${baseUrl}/checkout?canceled=true`,
      customerEmail: body.email,
    });

    if (!url) {
      throw new Error('No checkout URL generated');
    }

    return NextResponse.json({ url }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
