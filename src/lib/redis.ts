import { Redis } from '@upstash/redis';

/**
 * Cliente Redis para uso na Edge Runtime.
 * Utiliza variáveis de ambiente para conexão com o Upstash.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * Cache Warming: Função para garantir que os dados do tenant estejam no Redis.
 * Se não estiverem, busca no Neon e atualiza o cache.
 */
export const getTenantStatus = async (tenantId: string): Promise<string | null> => {
  const status = await redis.get<string>(`tenant:${tenantId}:status`);
  return status;
};

export const setTenantStatus = async (tenantId: string, status: 'ACTIVE' | 'OVER_BUDGET' | 'SUSPENDED') => {
  await redis.set(`tenant:${tenantId}:status`, status);
};
