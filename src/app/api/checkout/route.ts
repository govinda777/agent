import { NextResponse } from 'next/server';
import { ProcessCheckoutUseCase } from '@/modules/checkout/useCases/ProcessCheckoutUseCase';
import { requireAuth } from '@/modules/auth/server';
import { env } from '@/config/env';

const processCheckoutUseCase = new ProcessCheckoutUseCase();

export async function POST(request: Request) {
  try {
    const { tenantId } = await requireAuth(request);

    const body = await request.json();
    
    // Centralized price logic in Backend
    const productName = "Plano Profissional Agent 2026";
    const amountInCents = 9700; // R$ 97,00
    
    const host = request.headers.get('host');
    const protocol = env.nodeEnv === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const { url } = await processCheckoutUseCase.execute({
      productName,
      amountInCents,
      tenantId,
      successUrl: `${baseUrl}/${tenantId}/checkout/success`,
      cancelUrl: `${baseUrl}/${tenantId}/checkout?canceled=true`,
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
