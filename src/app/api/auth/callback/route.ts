import { NextResponse } from 'next/server';
import { tokenVerifier } from '@/modules/auth/di';
import { prisma } from '@/lib/prisma';
import { EventStore } from '@/lib/cqrs/EventStore';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
    }

    // 1. Validar o token Privy
    const privyId = await tokenVerifier.verifyToken(accessToken);

    // 2. Garantir que o usuário existe na DB global
    let user = await prisma.user.findUnique({
      where: { privyId },
      include: { tenants: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { privyId },
        include: { tenants: true }
      });
    }

    // 3. Registrar Evento de Login
    await EventStore.append({
      tenantId: user.tenants[0]?.tenantId || 'GLOBAL',
      aggregateType: 'USER',
      aggregateId: user.id,
      eventType: 'UserLoggedIn',
      payload: {
        userId: user.id,
        privyId: privyId,
        timestamp: new Date().toISOString()
      }
    });

    // 4. Criar Sessão JWE
    // Se o usuário já tem um tenant, usamos o primeiro. Se não, ficará vazio até o provisioning.
    const tenantId = user.tenants[0]?.tenantId || '';
    await createSession({
      privyToken: accessToken,
      tenantId,
      userId: user.id,
      privyId,
      tenants: user.tenants.map(t => t.tenantId)
    });

    return NextResponse.json({ success: true, userId: user.id, tenantId });
  } catch (error: any) {
    console.error('Auth callback error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 401 });
  }
}
