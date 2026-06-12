import { tokenVerifier, authenticateUserUseCase } from '../di';

export async function requireAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  let privyId: string;

  try {
    privyId = await tokenVerifier.verifyToken(token);
  } catch {
    throw new Error('Invalid or expired token');
  }

  const requestedTenantId = request.headers.get('x-tenant-id');

  const session = await authenticateUserUseCase.execute({
    privyId,
    requestedTenantId,
  });

  return session;
}
