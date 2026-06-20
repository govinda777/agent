# Arquitetura Agent 2026

Esta arquitetura foi desenhada para suportar uma plataforma SaaS multi-tenant de agentes de IA com performance extrema, isolamento de dados nativo e auditabilidade total.

## 🏛️ Pilares da Arquitetura

### 1. Governança na Borda (Edge Governance)
O arquivo `src/proxy.ts` opera na **Vercel Edge Runtime**. Ele é o primeiro ponto de contato de qualquer requisição.
- **Identificação de Tenant:** Extraída via subdomínio ou header `x-tenant-id`.
- **Validação de Cota:** O Proxy consulta o **Upstash Redis** (latência < 5ms). Se o tenant estiver `OVER_BUDGET` ou `SUSPENDED`, a requisição é bloqueada antes de chegar ao servidor.
- **Roteamento Dinâmico:** Utiliza `NextResponse.rewrite` para mapear subdomínios para a estrutura `app/[tenant]/`.

### 2. Isolamento Nativo (Neon RLS)
Utilizamos **Row Level Security (RLS)** do Postgres no Neon para garantir que um tenant nunca veja dados de outro.
- **Prisma Extension:** Injeta `SET LOCAL app.current_tenant_id = 'id'` automaticamente em todas as transações.
- **Isolamento de Banco:** Mesmo erros na camada de aplicação não permitem o vazamento de dados, pois o banco filtra os resultados no nível do motor SQL.

### 3. Event Sourcing & CQRS
O estado da aplicação é derivado de uma sequência de eventos imutáveis.
- **Commands:** Intenções de mudança (ex: `CreateAgentCommand`).
- **Events:** Fatos ocorridos (ex: `AgentCreated`).
- **Projections:** Tabelas de leitura otimizadas (Read Models) atualizadas reativamente pelo Event Bus.

## 📂 Estrutura de Pastas

- `src/app/[tenant]/`: Interface do usuário isolada por tenant.
- `src/lib/cqrs/`: Core da infraestrutura de eventos.
- `src/modules/[domain]/commands`: Lógica de escrita e regras de negócio.
- `src/modules/[domain]/projections`: Handlers que atualizam os Read Models e Cache.
