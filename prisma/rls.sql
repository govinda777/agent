-- ============================================================================
-- ARQUITETURA AGENT 2026: SCHEMA, TABLES E ISOLAMENTO DE TENANTS (NEON RLS)
-- ============================================================================

-- 1. Criação das Tabelas Base (Sincronizado com schema.prisma)
-- ... [Tabelas já existentes no passo anterior seriam atualizadas aqui] ...

-- 2. Esquema de Segurança e Função de Contexto
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.current_tenant_id() RETURNS TEXT AS $$
  SELECT current_setting('app.current_tenant_id', TRUE);
$$ LANGUAGE sql STABLE;

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Agent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventStore" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExecutionProjection" ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Isolamento

-- [EVENT_STORE] Isolamento absoluto da fonte da verdade
DROP POLICY IF EXISTS event_store_isolation_policy ON "EventStore";
CREATE POLICY event_store_isolation_policy ON "EventStore"
    FOR ALL
    USING ("tenantId" = auth.current_tenant_id());

-- [EXECUTION_PROJECTION] Isolamento para leituras de status
DROP POLICY IF EXISTS execution_projection_isolation_policy ON "ExecutionProjection";
CREATE POLICY execution_projection_isolation_policy ON "ExecutionProjection"
    FOR ALL
    USING ("tenantId" = auth.current_tenant_id());

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
