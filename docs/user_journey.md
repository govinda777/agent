# 📚 User Journey & Architecture Documentation

## Overview
Este documento descreve, passo a passo, os fluxos principais da aplicação **Agent Platform** seguindo os padrões de CQRS + Event Sourcing.

---

## 1️⃣ Fluxos de Usuário

### 1. Home
- **Objetivo**: Exibir landing page estática com chamada à ação.
- **Ponto de entrada**: `/`
- **Padrão**: Renderização via Next.js **App Router** (`src/app/(marketing)/page.tsx`).

### 2. Login
- **Objetivo**: Autenticar usuário via provedor Privy.
- **Rota**: `/login`
- **Fluxo**:
  1. Usuário clica em *Login*.
  2. Redirecionamento para o fluxo OAuth do **Privy**.
  3. Callback cliente recebe `access_token`.
  4. POST para `src/app/api/auth/callback/route.ts`.
- **Padrão**: Publica `UserLoggedIn` e cria sessão JWE segura.

### 3. Login Success (Tenant Provisioning)
- **Objetivo**: Garantir que o usuário tenha um *tenant* (`free tier`).
- **Rota**: `/login/success` (Mapeado em `src/app/login/success/route.ts`)
- **Passos**:
  1. Verifica se existe `tenantId` na sessão JWE.
  2. **Se não existir** → Dispara `CreateTenantCommand`.
  3. O Handler faz append de `TenantCreated` e `TenantUserAssociated` na **EventStore**.
  4. Atualiza a sessão JWE com o novo `tenantId`.
  5. Dispara `CreateAgentCommand` para criar um agente de teste.
- **Padrão**: Todas as ações geram eventos imutáveis.

### 4. Checkout (Stripe Integration)
- **Objetivo**: Permitir upgrade de plano.
- **Rota**: `/checkout`
- **Passos**:
  1. Usuário clica *Upgrade* → chamada a `src/app/api/stripe/create-session/route.ts`.
  2. Publica evento `CheckoutStarted`.
  3. Webhook `src/app/api/stripe/webhook/route.ts` recebe `checkout.session.completed`.
  4. Valida idempotência via `externalEventId` na **EventStore**.
  5. Evento `CheckoutCompleted` é publicado.
  6. **Projector** atualiza o status do tenant na Read Model (tabela `Tenant`).

---

## 2️⃣ Requisitos Não Funcionais (NFR)
| NFR | Descrição | Implementação | Conformidade |
|-----|------------|---------------|--------------|
| **Auditabilidade** | Estados críticos rastreáveis via eventos. | EventStore centralizada. | ✅ Conforme |
| **Performance** | Latência < 200 ms para leitura. | Cache na Edge (Redis) + JWE local decryption. | ✅ Conforme |
| **Idempotência** | Webhooks resilientes a retries. | Unique constraint no `externalEventId`. | ✅ Conforme |
| **Segurança** | Claims de Tenant protegidas. | Sessão JWE criptografada (A256GCM). | ✅ Conforme |

---

## 3️⃣ Referências de Código
- **Event Bus**: `src/lib/cqrs/EventBus.ts`
- **Event Store**: `src/lib/cqrs/EventStore.ts`
- **Módulo Tenants**: `src/modules/tenants/`
- **Módulo Checkout**: `src/modules/checkout/`
- **Sessão Segura**: `src/lib/session.ts`
- **Proxy/Middleware**: `src/proxy.ts`

---
*Documento atualizado para refletir a arquitetura CQRS + Event Sourcing (Junho 2026).*
