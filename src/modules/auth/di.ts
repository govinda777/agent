import { TokenVerifier } from './domain/TokenVerifier';
import { PrivyTokenVerifier } from './infrastructure/PrivyTokenVerifier';
import { MockTokenVerifier } from './mocks/MockTokenVerifier';

const isTest = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST === 'true';

export const tokenVerifier: TokenVerifier = isTest
  ? new MockTokenVerifier()
  : new PrivyTokenVerifier();
