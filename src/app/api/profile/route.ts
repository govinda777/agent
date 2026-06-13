import { NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/server';
import { prisma } from '@/lib/prisma';
import { CryptoService } from '@/lib/crypto';

export async function POST(request: Request) {
  try {
    const { userId, privyId } = await requireAuth(request);
    const body = await request.json();

    const { llmProvider, llmApiKey } = body;

    const updateData: { llmProvider: string | null; llmApiKey?: string } = {
      llmProvider: llmProvider || null,
    };

    if (llmApiKey !== undefined && llmApiKey !== null && llmApiKey !== '') {
      updateData.llmApiKey = CryptoService.encryptWithPrivy(llmApiKey, privyId);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(
      { message: 'Profile updated successfully', provider: updatedUser.llmProvider },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        llmProvider: true,
        // Do NOT select llmApiKey to send to frontend
        llmApiKey: true,
      },
    });

    return NextResponse.json(
      {
        llmProvider: user?.llmProvider || null,
        hasApiKey: !!user?.llmApiKey,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
