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

  async create(privyId: string) {
    return prisma.user.create({
      data: { privyId },
      include: { tenants: true }
    });
  }

  async updateProfile(userId: string, data: { llmProvider?: string | null, llmApiKey?: string | null }) {
    return prisma.user.update({
      where: { id: userId },
      data
    });
  }
}
