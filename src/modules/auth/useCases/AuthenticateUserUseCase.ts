import { UserRepository } from '../domain/repositories/UserRepository';
import { CreateAgentUseCase } from '../../agents/useCases/CreateAgentUseCase';
import { env } from '@/config/env';

interface AuthenticateUserDTO {
  privyId: string;
  requestedTenantId?: string | null;
}

interface AuthenticateUserResult {
  userId: string;
  privyId: string;
  tenantId: string;
}

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private createAgentUseCase: CreateAgentUseCase
  ) {}

  async execute(dto: AuthenticateUserDTO): Promise<AuthenticateUserResult> {
    let user = await this.userRepository.findByPrivyId(dto.privyId);

    // Recupera os dias de trial das configurações de ambiente com fallback seguro caso seja NaN
    const trialDays = Number.isNaN(env.freePlanTrialDays) ? 0 : env.freePlanTrialDays;
    const trialDuration = trialDays * 24 * 60 * 60 * 1000;
    const trialEndsAt = new Date(Date.now() + trialDuration);

    let isNewTenantCreated = false;
    let targetTenantId = '';

    if (!user) {
      user = await this.userRepository.createUserWithTenant(dto.privyId, trialEndsAt);
      targetTenantId = user.tenants[0].tenantId;
      isNewTenantCreated = true;
    } else if (user.tenants.length === 0) {
      const newTenant = await this.userRepository.createTenantForUser(user.id, trialEndsAt);
      targetTenantId = newTenant.id;
      isNewTenantCreated = true;
    } else {
      targetTenantId = user.tenants[0].tenantId;
    }

    if (isNewTenantCreated) {
      // Cria o agente n8n padrão para este novo tenant
      await this.createAgentUseCase.execute({
        tenantId: targetTenantId,
        name: 'Agente n8n Padrão',
        n8nWebhookUrl: env.n8nWebhookUrl,
        n8nAuthToken: env.n8nAuthToken,
        channels: {
          web: true,
          whatsapp: false,
          instagram: false,
        },
      });
    }

    if (dto.requestedTenantId) {
      // Se houver um usuário retornado recentemente, recarrega-o para garantir que pegamos os tenants corretos
      const latestUser = await this.userRepository.findByPrivyId(dto.privyId);
      const hasAccess = latestUser?.tenants.some((t) => t.tenantId === dto.requestedTenantId);
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
