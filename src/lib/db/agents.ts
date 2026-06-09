import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dataDir = path.join(process.cwd(), 'data');
const agentsFile = path.join(dataDir, 'agents.json');

// Ensure data directory and file exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(agentsFile)) {
  fs.writeFileSync(agentsFile, JSON.stringify([]));
}

// Simple encryption/decryption for MVP (Do not use in production without real key management)
const LOCAL_ENC_KEY = process.env.ENCRYPTION_KEY || '00000000000000000000000000000000';
const ALGORITHM = 'aes-256-cbc';

export function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(LOCAL_ENC_KEY.slice(0, 32).padEnd(32, '0')), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
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

export interface Agent {
  id: string;
  name: string;
  n8nWebhookUrl: string;
  n8nAuthToken: string; // Stored encrypted
  channels: {
    web: boolean;
    whatsapp: boolean;
    instagram: boolean;
  };
  createdAt: string;
}

export function getAgents(): Agent[] {
  try {
    const data = fs.readFileSync(agentsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading agents file:', error);
    return [];
  }
}

export function saveAgent(agentData: Omit<Agent, 'id' | 'createdAt'>): Agent {
  const agents = getAgents();

  const newAgent: Agent = {
    ...agentData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    // Encrypt the sensitive token before saving
    n8nAuthToken: encrypt(agentData.n8nAuthToken)
  };

  agents.push(newAgent);
  fs.writeFileSync(agentsFile, JSON.stringify(agents, null, 2));

  return newAgent;
}

export function getAgentById(id: string): Agent | null {
  const agents = getAgents();
  const agent = agents.find(a => a.id === id);
  if (!agent) return null;

  return agent;
}

export function getDecryptedAgentById(id: string): Agent | null {
  const agent = getAgentById(id);
  if (!agent) return null;

  return {
    ...agent,
    n8nAuthToken: decrypt(agent.n8nAuthToken)
  };
}
