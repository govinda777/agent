import { User, Tenant, TenantUser } from '@prisma/client';

export type UserWithTenants = User & {
  tenants: (TenantUser & { tenant: Tenant })[];
};

export interface UserRepository {
  findByPrivyId(privyId: string): Promise<UserWithTenants | null>;
  createUserWithTenant(privyId: string, trialEndsAt: Date): Promise<UserWithTenants>;
  createTenantForUser(userId: string, trialEndsAt: Date): Promise<Tenant>;
}
