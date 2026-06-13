import { NextResponse } from 'next/server';
import { tokenVerifier, provisionUserCommand } from '@/modules/auth/di';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let privyId: string;

    try {
      privyId = await tokenVerifier.verifyToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Execute the provisioning command
    await provisionUserCommand.execute({ privyId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error during auth sync:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
