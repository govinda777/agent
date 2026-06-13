import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { Agent as DbAgent } from '@prisma/client';
import { Agent } from '../domain/Agent';
import { AgentRepository } from '../domain/repositories/AgentRepository';
import { env } from '@/config/env';

const LOCAL_ENC_KEY = env.encryptionKey;
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(LOCAL_ENC_KEY.slice(0, 32).padEnd(32, '0')),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  if (!text) return text;
  try {
    const textParts = text.split(':');
    const ivHex = textParts.shift();
    if (!ivHex) return text;
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(LOCAL_ENC_KEY.slice(0, 32).padEnd(32, '0')),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    console.error('Error decrypting:', e);
    return text;
  }
}

// Ensure tenant exists for MVP
async function ensureTenant(tenantId: string) {
  let tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    const trialDays = env.freePlanTrialDays;
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    tenant = await prisma.tenant.create({
      data: {
        id: tenantId,
        status: 'FREE',
        trialEndsAt,
      },
    });
  }
  return tenant;
}

export class PrismaAgentRepository implements AgentRepository {
  private mapToDomain(dbAgent: DbAgent): Agent {
    return {
      id: dbAgent.id,
      name: dbAgent.name,
      n8nWebhookUrl: dbAgent.n8nWebhookUrl,
      n8nAuthToken: dbAgent.n8nAuthToken,
      channels: {
        web: dbAgent.channelWeb,
        whatsapp: dbAgent.channelWhatsapp,
        instagram: dbAgent.channelInstagram,
      },
      createdAt: dbAgent.createdAt.toISOString(),
    };
  }

  async save(tenantId: string, agentData: Omit<Agent, 'id' | 'createdAt'>): Promise<Agent> {
    await ensureTenant(tenantId);

    const created = await prisma.agent.create({
      data: {
        name: agentData.name,
        n8nWebhookUrl: agentData.n8nWebhookUrl,
        n8nAuthToken: encrypt(agentData.n8nAuthToken),
        channelWeb: agentData.channels.web,
        channelWhatsapp: agentData.channels.whatsapp,
        channelInstagram: agentData.channels.instagram,
        tenantId,
      },
    });
    return this.mapToDomain(created);
  }

  async findAll(tenantId: string): Promise<Agent[]> {
    await ensureTenant(tenantId);
    const agents = await prisma.agent.findMany({ where: { tenantId } });
    return agents.map(this.mapToDomain);
  }

  async findById(id: string, tenantId: string): Promise<Agent | null> {
    const agent = await prisma.agent.findFirst({ where: { id, tenantId } });
    return agent ? this.mapToDomain(agent) : null;
  }

  async getDecryptedById(id: string): Promise<Agent | null> {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) return null;

    const domainAgent = this.mapToDomain(agent);
    domainAgent.n8nAuthToken = decrypt(domainAgent.n8nAuthToken);
    return domainAgent;
  }

  async getTenantDetails(tenantId: string) {
    const tenant = await ensureTenant(tenantId);
    const count = await prisma.agent.count({ where: { tenantId } });

    return {
      status: tenant.status,
      trialEndsAt: tenant.trialEndsAt,
      executionsUsed: tenant.executionsUsed,
      agentsCount: count,
    };
  }

  async incrementExecutions(tenantId: string): Promise<void> {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { executionsUsed: { increment: 1 } },
    });
  }

  async update(id: string, tenantId: string, agentData: Partial<Agent>): Promise<Agent> {
    const updateData: Partial<Omit<DbAgent, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>> = {};
    if (agentData.name !== undefined) updateData.name = agentData.name;
    if (agentData.n8nWebhookUrl !== undefined) updateData.n8nWebhookUrl = agentData.n8nWebhookUrl;
    if (agentData.n8nAuthToken !== undefined) {
      updateData.n8nAuthToken = encrypt(agentData.n8nAuthToken);
    }

    if (agentData.channels !== undefined) {
      if (agentData.channels.web !== undefined) updateData.channelWeb = agentData.channels.web;
      if (agentData.channels.whatsapp !== undefined)
        updateData.channelWhatsapp = agentData.channels.whatsapp;
      if (agentData.channels.instagram !== undefined)
        updateData.channelInstagram = agentData.channels.instagram;
    }

    const updated = await prisma.agent.update({
      where: { id, tenantId },
      data: updateData,
    });
    return this.mapToDomain(updated);
  }
}
