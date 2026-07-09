import { User, TenantUser } from '@prisma/client';

export interface IUserRepository {
  findByPrivyId(privyId: string): Promise<(User & { tenants: TenantUser[] }) | null>;
  findById(id: string): Promise<User | null>;
  create(privyId: string): Promise<User & { tenants: TenantUser[] }>;
  updateProfile(userId: string, data: { llmProvider?: string | null, llmApiKey?: string | null }): Promise<User>;
}
