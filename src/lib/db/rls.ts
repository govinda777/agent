import { Prisma } from '@prisma/client';

/**
 * Extension para o Prisma que injeta automaticamente o tenant_id na sessão do Postgres.
 * Isso garante que o RLS do Neon funcione de forma transparente.
 */
export const withRLS = (tenantId: string) => {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // @ts-expect-error - Prisma transaction types are complex with extensions
            const [, result] = await client.$transaction([
              client.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}';`),
              query(args),
            ]);
            return result;
          },
        },
      },
    });
  });
};
