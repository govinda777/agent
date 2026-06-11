const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');

// Simple manual env file loader
function loadEnv() {
  if (fs.existsSync('.env')) {
    const content = fs.readFileSync('.env', 'utf-8');
    content.split('\n').forEach(line => {
      const matched = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (matched) {
        const key = matched[1];
        let value = (matched[2] || '').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

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
  console.log('🌱 Iniciando o seed do banco de dados...');

  const tenantId = 'd1b00000-0000-0000-0000-000000000000';

  // 1. Upsert Tenant Padrão
  const tenant = await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: {
      id: tenantId,
      status: 'FREE',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias de trial
      executionsUsed: 0,
    },
  });
  console.log(`Tenant configurado: ${tenant.id}`);

  // 2. Criar ou atualizar Agente Padrão vinculado ao n8n local
  const agentName = 'Agente n8n Padrão';
  const webhookUrl = 'http://localhost:5678/webhook/1/webhook/agent-webhook';
  
  // Limpar agentes padrão anteriores se existirem para evitar duplicados no dev
  await prisma.agent.deleteMany({
    where: {
      tenantId: tenant.id,
      name: agentName,
    }
  });

  const agent = await prisma.agent.create({
    data: {
      name: agentName,
      n8nWebhookUrl: webhookUrl,
      n8nAuthToken: encrypt('meu_token_secreto_n8n'),
      channelWeb: true,
      channelWhatsapp: false,
      channelInstagram: false,
      tenantId: tenant.id,
    },
  });

  console.log(`🤖 Agente padrão configurado com sucesso! ID: ${agent.id}`);
  console.log(`   🔗 Webhook URL: ${agent.n8nWebhookUrl}`);
  console.log('🌱 Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
