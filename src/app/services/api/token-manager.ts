let tokenGetter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

export async function getAuthToken(): Promise<string> {
  if (!tokenGetter) {
    throw new Error('Token getter not initialized. Call setTokenGetter first.');
  }

  const token = await tokenGetter();
  if (!token) {
    throw new Error('Token não encontrado');
  }

  return token;
}
