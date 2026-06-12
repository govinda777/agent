import { TokenVerifier } from './domain/TokenVerifier';
import { PrivyTokenVerifier } from './infrastructure/PrivyTokenVerifier';
import { MockTokenVerifier } from './mocks/MockTokenVerifier';
import { PrismaUserRepository } from './infrastructure/PrismaUserRepository';
import { AuthenticateUserUseCase } from './useCases/AuthenticateUserUseCase';
import { createAgentUseCase } from '../agents/di';

const isTest = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST === 'true';

export const tokenVerifier: TokenVerifier = isTest
  ? new MockTokenVerifier()
  : new PrivyTokenVerifier();

export const userRepository = new PrismaUserRepository();
export const authenticateUserUseCase = new AuthenticateUserUseCase(
  userRepository,
  createAgentUseCase
);
