# Agent Platform: Arquitetura 2026

Plataforma multi-tenant de agentes de IA baseada em princípios de **Decentralized Governance**, **Edge Computing** e **Event-Driven Architecture**.

## 🏗️ Arquitetura Core

O projeto foi refatorado para seguir os padrões modernos de 2026, focando em baixa latência e isolamento total.

### 🏛️ Destaques Técnicos:
- **Edge Proxy Governance**: Controle de cota e roteamento de tenants via Vercel Edge + Upstash Redis.
- **Neon RLS Isolation**: Isolamento nativo de dados no Postgres através de Row Level Security.
- **Event Sourcing & CQRS**: Estado da aplicação derivado de eventos imutáveis com segregação de leitura e escrita.
- **Dynamic Routing**: Padrão de pastas `app/[tenant]/` para contextos de interface isolados.

## 📚 Documentação Detalhada

Para entender profundamente como o sistema funciona, consulte:
- [Guia de Arquitetura 2026](docs/architecture/2026-architecture.md)
- [Funcionamento do Event Bus & Event Sourcing](docs/architecture/event-bus-guide.md)

---

## 🚀 Rodando o Projeto Localmente

O projeto utiliza o **Taskfile** (`go-task`) para simplificar e automatizar o setup.

### 1. Pré-requisitos
- **Node.js** (LTS)
- **Docker Desktop**
- **Task** (`npm install -g @go-task/cli`)

### 2. Iniciando o ambiente

```bash
task dev
```

Este comando configura o `.env`, instala dependências, sobe a infraestrutura (Postgres, Redis Mock, n8n) e inicia o Next.js.

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Outros comandos
- `task infra`: Sobe apenas os containers Docker.
- `task db`: Executa migrações/push do banco.
- `task test:unit`: Roda os testes unitários.
- `task lint`: Verifica padrões de código.

---

## 🛠️ Tecnologias Principais
- **Framework**: Next.js (App Router)
- **Runtime**: Node.js & Edge Runtime
- **Database**: Neon (PostgreSQL) com RLS
- **Cache/Edge Store**: Upstash Redis
- **Auth**: Privy
- **ORM**: Prisma com Extensions
