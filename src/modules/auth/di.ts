import { env } from '@/config/env';
import { MockTokenVerifier } from './mocks/MockTokenVerifier';
import { PrivyTokenVerifier } from './infrastructure/PrivyTokenVerifier';

// --- Infrastructure: Auth ---
export const tokenVerifier = env.nodeEnv === 'test' || (env.nodeEnv === 'development' && !env.privyAppSecret)
  ? new MockTokenVerifier()
  : new PrivyTokenVerifier();
