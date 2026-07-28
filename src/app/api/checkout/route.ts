import { NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/server';
import { startCheckoutHandler } from '@/modules/checkout/di';
import { StartCheckoutCommand } from '@/modules/checkout/commands/StartCheckoutCommand';

export async function POST(request: Request) {
  try {
    const { tenantId, userId } = await requireAuth(request);

    // Follow Command-based architecture
    const checkoutUrl = await startCheckoutHandler.execute(
      new StartCheckoutCommand(tenantId, userId, 'PRO')
    );

    return NextResponse.json({ url: checkoutUrl }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
