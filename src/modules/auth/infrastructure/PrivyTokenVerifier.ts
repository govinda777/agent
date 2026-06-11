import { TokenVerifier } from '../domain/TokenVerifier';
import { privy } from './privy-client';

export class PrivyTokenVerifier implements TokenVerifier {
  async verifyToken(token: string): Promise<string> {
    const verifiedClaims = await privy.verifyAuthToken(token);
    return verifiedClaims.userId;
  }
}
