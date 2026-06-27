# ⚡ Event Bus & Event Sourcing Guide (2026)

## Visão Geral
Nesta arquitetura, a **EventStore** é a única fonte da verdade. O estado atual dos Tenants e Agentes é uma projeção derivada da sequência de eventos imutáveis.

## Fluxo de um Comando
1. **Command**: Recebe a intenção do usuário (ex: `CreateTenantCommand`).
2. **Handler**: Valida a regra de negócio e registra o fato.
3. **EventStore.append()**:
   - Salva o evento no PostgreSQL.
   - Publica no `eventBus` (Síncrono/In-memory).
   - Publica no `durableBus` (Assíncrono via QStash).
4. **Projectors**: Escutam o `eventBus` e atualizam as tabelas de leitura (`Tenant`, `Agent`, etc.).

## Eventos Implementados
- `UserLoggedIn`: Registra a autenticação do usuário.
- `TenantCreated`: Provisionamento de novo espaço de trabalho.
- `TenantUserAssociated`: Vínculo de permissão entre Usuário e Tenant.
- `CheckoutStarted`: Início do fluxo de pagamento no Stripe.
- `CheckoutCompleted`: Confirmação de pagamento e upgrade de plano.
- `AgentCreated`: Criação de novo agente de IA.

## Idempotência
Para webhooks externos (Stripe), usamos a coluna `externalEventId` na `EventStore`. O banco de dados garante via constraint UNIQUE que o mesmo evento não seja processado duas vezes, garantindo a consistência do faturamento.

## Segurança e RLS
Cada evento na `EventStore` possui um `tenantId`. Graças ao **Neon RLS**, nenhum Projector ou Query pode ler eventos de um tenant que não pertence à sessão ativa.
