import { UserRepository } from '../domain/repositories/UserRepository';
import { CreateAgentUseCase } from '../../agents/useCases/CreateAgentUseCase';
import { env } from '@/config/env';

export interface ProvisionUserDTO {
  privyId: string;
}

export class ProvisionUserCommand {
  constructor(
    private userRepository: UserRepository,
    private createAgentUseCase: CreateAgentUseCase
  ) {}

  async execute(dto: ProvisionUserDTO): Promise<void> {
    const trialDays = Number.isNaN(env.freePlanTrialDays) ? 0 : env.freePlanTrialDays;
    const trialDuration = trialDays * 24 * 60 * 60 * 1000;
    const trialEndsAt = new Date(Date.now() + trialDuration);

    let targetTenantId = '';
    let isNewTenantCreated = false;

    // First check if already exists to avoid unnecessary writes
    let user = await this.userRepository.findByPrivyId(dto.privyId);

    try {
      if (!user) {
        user = await this.userRepository.createUserWithTenant(dto.privyId, trialEndsAt);
        targetTenantId = user.tenants[0].tenantId;
        isNewTenantCreated = true;
      } else if (user.tenants.length === 0) {
        const newTenant = await this.userRepository.createTenantForUser(user.id, trialEndsAt);
        targetTenantId = newTenant.id;
        isNewTenantCreated = true;
      } else {
        // User and tenant already exist, nothing to provision
        return;
      }
    } catch (error: any) {
      // P2002 is the Prisma error code for Unique constraint failed
      if (error.code === 'P2002') {
        // Another thread provisioned the user exactly at this moment
        return;
      }
      throw error;
    }

    if (isNewTenantCreated) {
      try {
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
      } catch (agentError) {
        console.error('Failed to provision default agent:', agentError);
        // We do not throw here, the user and tenant were successfully created.
        // We can let the user continue.
      }
    }
  }
}
