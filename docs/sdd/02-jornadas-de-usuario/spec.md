# 2. Jornadas de Usuário e Fluxos Globais End-to-End

A arquitetura do sistema e a experiência do usuário (UX) precisam fluir juntas. Esta seção documenta os caminhos ponta-a-ponta que o cliente ("Tenant Owner") irá trilhar, clarificando os processos assíncronos e a delegação de interface (UI) entre a nossa plataforma e os serviços integrados.

## 2.1 Jornada Global A: Onboarding e Subscrição Inicial

O objetivo desta jornada é minimizar o atrito, garantindo que o utilizador consiga testar o produto de forma rápida (através da criação inicial de conta), mas estabelecendo imediatamente a conversão no Stripe como portal de transição.

### O Fluxo

```mermaid
sequenceDiagram
    autonumber
    actor User as Utilizador (Tenant)
    participant UI as Govinda UI (Next.js)
    participant Privy as Privy (Auth)
    participant DB as Neon DB (PostgreSQL)
    participant Stripe as Stripe (Billing)

    User->>UI: Acessa Landing Page e clica "Começar"
    UI->>Privy: Aciona Modal de Autenticação
    Privy-->>User: Solicita Email/Google Login
    User->>Privy: Confirma Identidade
    Privy-->>UI: Retorna JWT e UserID

    UI->>DB: POST /api/tenants (Verifica/Cria Registo do Utilizador)
    DB-->>UI: Retorna Status do Plano (ex: "Sem Plano Ativo")

    UI-->>User: Apresenta Ecrã de Seleção de Planos (Tiers)
    User->>UI: Escolhe o "Plano Starter (R$97/mês)" e clica Assinar

    UI->>Stripe: POST /api/checkout-session
    Stripe-->>UI: Retorna Checkout URL
    UI-->>User: Redireciona navegador para o Checkout Stripe

    User->>Stripe: Preenche Cartão de Crédito e Paga
    Stripe-->>UI: Redireciona para /success (Confirmação Visual)

    note over Stripe, DB: Webhook Assíncrono Background
    Stripe->>DB: Webhook (checkout.session.completed)
    DB->>DB: Atualiza `plan_id` e `is_active = true`
```

---

## 2.2 Jornada Global B: Criação de Agente, Base de Dados (RAG) e Implementação

Com a conta já paga, a jornada principal ocorre no Dashboard de Configuração, onde o sistema faz a ponte entre o Pinecone e a Governança Helicone.

### Fluxo Visual

```mermaid
sequenceDiagram
    autonumber
    actor Tenant as Tenant Owner
    participant UI as Dashboard (Next.js)
    participant DB as Neon DB
    participant Pinecone as Pinecone (RAG Vector)
    participant Helicone as Helicone (AI Gateway)

    Tenant->>UI: Clica "Novo Agente"
    UI-->>Tenant: Apresenta formulário (Nome, Descrição, System Prompt)
    Tenant->>UI: Submete formulário básico
    UI->>DB: Regista Agente (Status: Draft)

    Tenant->>UI: Área de "Conhecimento" - Faz Upload de 2 PDFs
    UI->>UI: Processa Chunking dos PDFs (Chunks de Texto)
    UI->>Pinecone: Gera Embeddings + Upsert obrigando Namespace = `agent_id`
    Pinecone-->>UI: Confirma Indexação

    Tenant->>UI: Ativa Canal "WebWidget" e Finaliza
    UI->>Helicone: POST API/VirtualKeys (Passa os limites de Orçamento do Tier)
    Helicone-->>UI: Retorna `virtual_key_id`
    UI->>DB: Associa o `virtual_key_id` ao Agente

    UI-->>Tenant: Exibe Ecrã "Sucesso" com Snippet JavaScript e Link de Teste
```

---

## 2.3 Jornada Global C: Gestão de Pagamento Recusado e Bloqueio

A segurança comercial da plataforma assenta na sua capacidade de travar custos instantaneamente se um utilizador não pagar, ao mesmo tempo que oferece uma UX clara de resolução, sem o suporte humano precisar de intervir.

### Sequência de Ações

```mermaid
sequenceDiagram
    autonumber
    actor Tenant as Tenant Owner
    participant Stripe as Stripe
    participant Backend as Webhook Worker
    participant DB as Neon DB
    participant Helicone as Helicone Proxy
    participant UI as Dashboard

    note over Stripe: Chega dia de Faturação
    Stripe->>Stripe: Tenta debitar Cartão
    Stripe-->>Stripe: Cartão Recusado (Sem saldo)

    Stripe->>Backend: Envia Webhook `invoice.payment_failed`
    Backend->>DB: UPDATE tenants SET is_active = false
    Backend->>Helicone: PATCH Virtual Key (Muda status para SUSPENSO/Disabled)

    note over Helicone: Os Agentes do cliente deixam instantaneamente de gastar Tokens

    Tenant->>UI: Faz Login no Painel
    UI->>DB: Puxa Status do Tenant
    DB-->>UI: Retorna `is_active = false`

    UI-->>Tenant: Mostra Banner Vermelho ("Pagamento Pendente. Agentes Pausados")
    Tenant->>UI: Clica em "Atualizar Método de Pagamento"
    UI->>Stripe: Chama API de Billing Portal do Stripe
    Stripe-->>Tenant: Ecrã nativo Stripe para alterar o Cartão

    Tenant->>Stripe: Atualiza e quita o débito
    Stripe->>Backend: Webhook `invoice.paid`
    Backend->>DB: Restaura `is_active = true`
    Backend->>Helicone: PATCH Virtual Key (Reativa)
```
