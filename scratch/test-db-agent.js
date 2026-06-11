const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');

// Simple manual env file loader
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  content.split('\n').forEach(line => {
    const matched = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (matched) {
      const key = matched[1];
      let value = (matched[2] || '').trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

loadEnvFile('.env');

const prisma = new PrismaClient();

const LOCAL_ENC_KEY = process.env.ENCRYPTION_KEY || 'coloque_aqui_uma_chave_de_32_caracteres_aleatorios';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(LOCAL_ENC_KEY.slice(0, 32).padEnd(32, '0')), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

async function main() {
  console.log("Starting DB connection test...");
  
  // 1. Create a dummy tenant
  const tenantId = "test-tenant-" + Math.random().toString(36).substring(7);
  console.log(`Creating tenant: ${tenantId}`);
  
  const tenant = await prisma.tenant.create({
    data: {
      id: tenantId,
      status: 'FREE',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    }
  });
  console.log("Tenant created successfully:", tenant.id);

  // 2. Create an agent for that tenant
  console.log("Creating agent...");
  const agent = await prisma.agent.create({
    data: {
      name: "Agent Testing Tool",
      n8nWebhookUrl: "http://localhost:5678/webhook/test-agent",
      n8nAuthToken: encrypt("test-token-123"),
      channelWeb: true,
      channelWhatsapp: false,
      channelInstagram: false,
      tenantId: tenant.id
    }
  });
  console.log("Agent created successfully in DB:", agent.id, agent.name);

  // 3. Query the agent
  const retrievedAgent = await prisma.agent.findUnique({
    where: { id: agent.id }
  });
  console.log("Retrieved agent from DB:", retrievedAgent.name);

  // 4. Cleanup
  console.log("Cleaning up test data...");
  await prisma.agent.delete({ where: { id: agent.id } });
  await prisma.tenant.delete({ where: { id: tenant.id } });
  console.log("Cleanup done!");
}

main()
  .catch(err => {
    console.error("Test failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
