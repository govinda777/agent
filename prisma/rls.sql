-- ============================================================================
-- ARQUITETURA AGENT 2026: SCHEMA, TABLES E ISOLAMENTO DE TENANTS (NEON RLS)
-- ============================================================================

-- 1. Criação das Tabelas Base (Sincronizado com schema.prisma)

CREATE TABLE IF NOT EXISTS "Tenant" (
    "id" TEXT PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'FREE',
    "trialEndsAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "executionsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "Agent" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "n8nWebhookUrl" TEXT NOT NULL,
    "n8nAuthToken" TEXT NOT NULL,
    "channelWeb" BOOLEAN NOT NULL DEFAULT FALSE,
    "channelWhatsapp" BOOLEAN NOT NULL DEFAULT FALSE,
    "channelInstagram" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "Agent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TenantUser" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT "TenantUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 2. Esquema de Segurança e Função de Contexto
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.current_tenant_id() RETURNS TEXT AS $$
  SELECT current_setting('app.current_tenant_id', TRUE);
$$ LANGUAGE sql STABLE;

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Agent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantUser" ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Isolamento

-- [TENANT] Restringe acesso ao próprio registro do tenant
DROP POLICY IF EXISTS tenant_isolation_policy ON "Tenant";
CREATE POLICY tenant_isolation_policy ON "Tenant"
    FOR ALL
    USING (id = auth.current_tenant_id());

-- [AGENT] Filtra agentes pelo tenant da sessão
DROP POLICY IF EXISTS agent_isolation_policy ON "Agent";
CREATE POLICY agent_isolation_policy ON "Agent"
    FOR ALL
    USING ("tenantId" = auth.current_tenant_id());

-- [TENANT_USER] Filtra associações de usuários pelo tenant da sessão
DROP POLICY IF EXISTS tenant_user_isolation_policy ON "TenantUser";
CREATE POLICY tenant_user_isolation_policy ON "TenantUser"
    FOR ALL
    USING ("tenantId" = auth.current_tenant_id());

-- 5. Comentários de Implementação:
-- Para aplicar este script no Neon, execute-o no SQL Editor do Console.
-- A aplicação deve definir o tenant_id antes de cada consulta:
-- SET LOCAL app.current_tenant_id = 'uuid-do-tenant';
