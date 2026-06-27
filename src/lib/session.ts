import { EncryptJWT, jwtDecrypt } from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'app-session';
// Use a fallback that is 32 bytes (256 bits) if ENCRYPTION_KEY is not set or invalid
const SECRET_KEY = Buffer.from(
  (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length >= 64)
    ? process.env.ENCRYPTION_KEY.substring(0, 64)
    : '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  'hex'
);

export interface SessionPayload {
  privyToken: string;
  tenantId: string;
  userId: string;
  privyId: string;
  tenants: string[]; // List of authorized tenant IDs
}

export async function createSession(payload: SessionPayload) {
  const expirationTime = '24h';

  const jwt = await new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .encrypt(SECRET_KEY);

  (await cookies()).set(SESSION_COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  });
}

export async function getSession(sessionToken?: string): Promise<SessionPayload | null> {
  let session = sessionToken;

  if (!session) {
    try {
      const cookieStore = await cookies();
      session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch (e) {
      // Ignore errors when cookies() is called outside of request scope (e.g. in tests)
    }
  }

  if (!session) return null;

  try {
    const { payload } = await jwtDecrypt(session, SECRET_KEY, {
      contentEncryptionAlgorithms: ['A256GCM'],
    });

    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error('Failed to decrypt session:', error);
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
