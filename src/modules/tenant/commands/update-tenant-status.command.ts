import { prisma } from '@/lib/prisma';

export class UpdateTenantStatusCommand {
  constructor(
    private tenantId: string,
    private status: string,
    private payload?: Record<string, unknown>
  ) {}

  async execute() {
    // Valida o status se necessário (FREE, ACTIVE, SUSPENDED)
    const validStatuses = ['FREE', 'ACTIVE', 'SUSPENDED'];
    if (!validStatuses.includes(this.status)) {
      throw new Error(`Invalid tenant status: ${this.status}`);
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Grava na Event Store (TenantEvent)
      const event = await tx.tenantEvent.create({
        data: {
          tenantId: this.tenantId,
          eventType: 'STATUS_UPDATED',
          payload: JSON.stringify({
            newStatus: this.status,
            ...this.payload,
          }),
        },
      });

      // 2. Atualiza o Read Model (Tenant)
      const tenant = await tx.tenant.update({
        where: { id: this.tenantId },
        data: { status: this.status },
      });

      return { tenant, event };
    });
  }
}
