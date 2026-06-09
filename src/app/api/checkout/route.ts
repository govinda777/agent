import { NextResponse } from 'next/server';
import { ProcessCheckoutUseCase } from '@/modules/checkout/useCases/ProcessCheckoutUseCase';
import { requireAuth } from '@/lib/auth';
import { env } from '@/config/env';

const processCheckoutUseCase = new ProcessCheckoutUseCase();

export async function POST(request: Request) {
  try {
    const { tenantId } = await requireAuth(request);

    const body = await request.json();
    
    if (!body.productName || !body.amountInCents) {
      return NextResponse.json({ error: 'Missing productName or amountInCents' }, { status: 400 });
    }
    const { productName, amountInCents } = body;
    
    const host = request.headers.get('host');
    const protocol = env.nodeEnv === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const { url } = await processCheckoutUseCase.execute({
      productName,
      amountInCents,
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
