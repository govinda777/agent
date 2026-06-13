import { UserRepository } from '../domain/repositories/UserRepository';

export interface GetUserByPrivyIdDTO {
  privyId: string;
  requestedTenantId?: string | null;
}

export interface GetUserByPrivyIdResult {
  userId: string;
  privyId: string;
  tenantId: string;
}

export class GetUserByPrivyIdQuery {
  constructor(private userRepository: UserRepository) {}

  async execute(dto: GetUserByPrivyIdDTO): Promise<GetUserByPrivyIdResult | null> {
    const user = await this.userRepository.findByPrivyId(dto.privyId);

    if (!user) {
      return null; // Not provisioned yet
    }

    if (user.tenants.length === 0) {
      return null; // Has user record but no tenants provisioned
    }

    let targetTenantId = user.tenants[0].tenantId;

    if (dto.requestedTenantId) {
      const hasAccess = user.tenants.some((t) => t.tenantId === dto.requestedTenantId);
      if (!hasAccess) {
        throw new Error('User does not have access to the requested tenant');
      }
      targetTenantId = dto.requestedTenantId;
    }

    return {
      userId: user.id,
      privyId: user.privyId,
      tenantId: targetTenantId,
    };
  }
}
