import { TokenVerifier } from '../domain/TokenVerifier';

export class MockTokenVerifier implements TokenVerifier {
  async verifyToken(token: string): Promise<string> {
    if (token.startsWith('mock-token-')) {
      return `did:privy:${token.replace('mock-token-', '')}`;
    }
    throw new Error('Invalid or expired token (mock)');
  }
}
