import { NextResponse } from 'next/server';
import { processCheckoutUseCase } from '@/modules/checkout/di';
import { requireAuth } from '@/modules/auth/server';
import { env } from '@/config/env';
import productsData from '@/config/products.json';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { priceId, email } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    // Find product matching the priceId from frontend
    const product = productsData.products.find(p => {
      // In a real app we'd map priceId to env variables directly or store Stripe IDs in JSON
      // For this app, we compare the requested priceId against env variables derived from the JSON mapping
      const envKey = p.priceIdEnvKey as keyof typeof env;
      const expectedPriceId = env[envKey] || (process.env[p.priceIdEnvKey] as string);
      return expectedPriceId === priceId;
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { productName, amountInCents, mode } = product as any;

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
      customerEmail: email,
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
