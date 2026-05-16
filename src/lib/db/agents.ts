import fs from 'fs/promises';
import path from 'path';

export interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  pineconeNamespace: string;
  tools: string[]; // List of tool names this agent is allowed to use
  modelName: string;
  channels: string[]; // e.g., ['web', 'whatsapp']
}

const DB_FILE = path.join(process.cwd(), 'data', 'agents.json');

// Ensure data directory exists
async function ensureDb() {
  try {
    await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      // If file doesn't exist, initialize with default agent
      const defaultAgents: Record<string, AgentConfig> = {
        'default': {
          id: 'default',
          name: 'Default Assistant',
          systemPrompt: `AI assistant is a brand new, powerful, human-like artificial intelligence.
The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is a well-behaved and well-mannered individual.
AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
AI assistant is a big fan of Pinecone and Vercel.
If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
AI assistant will not invent anything that is not drawn directly from the context.`,
          pineconeNamespace: process.env.PINECONE_NAMESPACE || 'default-namespace',
          tools: ['rag_search'], // The default rag search tool
          modelName: 'gpt-4o',
          channels: ['web']
        }
      };
      await fs.writeFile(DB_FILE, JSON.stringify(defaultAgents, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error("Error ensuring DB exists:", error);
  }
}

async function readDb(): Promise<Record<string, AgentConfig>> {
  await ensureDb();
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading DB:", error);
    return {};
  }
}

async function writeDb(data: Record<string, AgentConfig>) {
  await ensureDb();
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getAgent(id: string): Promise<AgentConfig | null> {
  const db = await readDb();
  return db[id] || null;
}

export async function createAgent(config: AgentConfig): Promise<AgentConfig> {
  const db = await readDb();
  if (db[config.id]) {
    throw new Error(`Agent with id ${config.id} already exists.`);
  }
  db[config.id] = config;
  await writeDb(db);
  return config;
}

export async function updateAgent(id: string, config: Partial<AgentConfig>): Promise<AgentConfig> {
  const db = await readDb();
  const agent = db[id];
  if (!agent) {
    throw new Error(`Agent with id ${id} not found.`);
  }
  const updatedAgent = { ...agent, ...config };
  db[id] = updatedAgent;
  await writeDb(db);
  return updatedAgent;
}

export async function listAgents(): Promise<AgentConfig[]> {
  const db = await readDb();
  return Object.values(db);
}
