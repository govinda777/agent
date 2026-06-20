import { PrismaClient } from '@prisma/client';
import { withRLS } from './db/rls';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const basePrisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export const prisma = basePrisma;

/**
 * Utilitário para obter uma instância do Prisma protegida por RLS.
 * @param tenantId O ID do tenant para isolamento.
 */
export const getPrismaWithRLS = (tenantId: string) => withRLS(tenantId)(basePrisma);

import { env } from '@/config/env';

if (env.nodeEnv !== 'production') globalThis.prismaGlobal = basePrisma;
