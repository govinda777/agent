import { NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/server';
import { userRepository } from '@/modules/users/di';
import { CryptoService } from '@/lib/crypto';

export async function POST(request: Request) {
  try {
    const { userId, privyId } = await requireAuth(request);
    const body = await request.json();

    const { llmProvider, llmApiKey } = body;

    // Encrypt the API key before saving
    let encryptedKey = null;
    if (llmApiKey) {
      encryptedKey = CryptoService.encryptWithPrivy(llmApiKey, privyId);
    }

    // Architecture Fix: Use Repository instead of direct Prisma
    const updatedUser = await userRepository.updateProfile(userId, {
      llmProvider: llmProvider || null,
      llmApiKey: encryptedKey,
    });

    return NextResponse.json(
      { message: 'Profile updated successfully', provider: updatedUser.llmProvider },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth(request);
    
    // Architecture Fix: Use Repository
    const user = await userRepository.findById(userId);

    return NextResponse.json({
      llmProvider: user?.llmProvider || null,
      hasApiKey: !!user?.llmApiKey,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
