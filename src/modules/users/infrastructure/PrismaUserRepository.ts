import { User, TenantUser } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { IUserRepository } from '../repositories/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  async findByPrivyId(privyId: string) {
    return prisma.user.findUnique({
      where: { privyId },
      include: { tenants: true }
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async upsert(userId: string, privyId: string) {
    return prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, privyId },
      update: {}
    });
  }

  async updateProfile(userId: string, data: { llmProvider?: string | null, llmApiKey?: string | null }) {
    return prisma.user.update({
      where: { id: userId },
      data
    });
  }
}
