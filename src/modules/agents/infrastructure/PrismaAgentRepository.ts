import crypto from 'crypto';
import { prisma, getPrismaWithRLS } from '@/lib/prisma';
import { Agent } from '../domain/Agent';
import { IAgentRepository } from '../repositories/IAgentRepository';
import { env } from '@/config/env';

const LOCAL_ENC_KEY = env.encryptionKey;
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(LOCAL_ENC_KEY.slice(0, 32).padEnd(32, '0')), iv);
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
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(LOCAL_ENC_KEY.slice(0, 32).padEnd(32, '0')), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    console.error('Error decrypting:', e);
    return text;
  }
}

export class PrismaAgentRepository implements IAgentRepository {
  
  private mapToDomain(dbAgent: any): Agent {
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
      createdAt: dbAgent.createdAt ? (typeof dbAgent.createdAt.toISOString === 'function' ? dbAgent.createdAt.toISOString() : new Date(dbAgent.createdAt).toISOString()) : new Date().toISOString(),
    };
  }

  async save(tenantId: string, agentData: Omit<Agent, 'id' | 'createdAt'> & { id?: string }): Promise<Agent> {
    const db = getPrismaWithRLS(tenantId);
    
    // We use upsert to handle both creation and update from projections
    const created = await db.agent.upsert({
      where: { id: agentData.id || '' },
      create: {
        id: agentData.id,
        name: agentData.name,
        n8nWebhookUrl: agentData.n8nWebhookUrl,
        n8nAuthToken: encrypt(agentData.n8nAuthToken),
        channelWeb: agentData.channels.web,
        channelWhatsapp: agentData.channels.whatsapp,
        channelInstagram: agentData.channels.instagram,
        tenantId,
      },
      update: {
        name: agentData.name,
        n8nWebhookUrl: agentData.n8nWebhookUrl,
        n8nAuthToken: encrypt(agentData.n8nAuthToken),
        channelWeb: agentData.channels.web,
        channelWhatsapp: agentData.channels.whatsapp,
        channelInstagram: agentData.channels.instagram,
      }
    });
    return this.mapToDomain(created);
  }

  async findAll(tenantId: string): Promise<Agent[]> {
    const db = getPrismaWithRLS(tenantId);
    const agents = await db.agent.findMany();
    return agents.map(this.mapToDomain);
  }

  async findById(id: string, tenantId: string): Promise<Agent | null> {
    const db = getPrismaWithRLS(tenantId);
    const agent = await db.agent.findFirst({ where: { id } });
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
    const db = getPrismaWithRLS(tenantId);
    const [tenant, count] = await Promise.all([
      db.tenant.findUnique({ where: { id: tenantId } }),
      db.agent.count()
    ]);
    
    if (!tenant) throw new Error('Tenant not found');

    return {
      status: tenant.status,
      trialEndsAt: tenant.trialEndsAt,
      executionsUsed: tenant.executionsUsed,
      agentsCount: count,
    };
  }

  async incrementExecutions(tenantId: string): Promise<void> {
    const db = getPrismaWithRLS(tenantId);
    await db.tenant.update({
      where: { id: tenantId },
      data: { executionsUsed: { increment: 1 } }
    });
  }

  async update(id: string, tenantId: string, agentData: Partial<Agent>): Promise<Agent> {
    const db = getPrismaWithRLS(tenantId);
    const updateData: any = {};
    if (agentData.name !== undefined) updateData.name = agentData.name;
    if (agentData.n8nWebhookUrl !== undefined) updateData.n8nWebhookUrl = agentData.n8nWebhookUrl;
    if (agentData.n8nAuthToken !== undefined) {
      updateData.n8nAuthToken = encrypt(agentData.n8nAuthToken);
    }
    
    if (agentData.channels !== undefined) {
      if (agentData.channels.web !== undefined) updateData.channelWeb = agentData.channels.web;
      if (agentData.channels.whatsapp !== undefined) updateData.channelWhatsapp = agentData.channels.whatsapp;
      if (agentData.channels.instagram !== undefined) updateData.channelInstagram = agentData.channels.instagram;
    }

    const updated = await db.agent.update({
      where: { id },
      data: updateData
    });
    return this.mapToDomain(updated);
  }
}
