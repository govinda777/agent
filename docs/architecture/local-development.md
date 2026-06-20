# Guia de Desenvolvimento Local (Agent 2026)

Esta plataforma utiliza componentes de Edge e Mensageria Durável que precisam ser simulados localmente para uma experiência de desenvolvimento fiel à produção.

## 🛠️ Como rodar a infraestrutura completa

O comando principal para iniciar tudo é:

```bash
task dev
```

Este comando orquestra:
1.  **Docker:** Sobe o Postgres (Neon Mock) e o n8n.
2.  **Event Simulator:** Inicia o `scripts/simulate-qstash.js` na porta 8080.
3.  **Next.js:** Inicia o servidor App Router na porta 3000.

## 📡 Simulando Eventos e Projeções

Quando você executa uma ação que gera um evento (ex: criar um agente):
1.  O comando grava na `EventStore` local.
2.  O `DurableBus` envia o evento para o simulador na porta 8080.
3.  O simulador re-encaminha para `localhost:3000/api/webhooks/projections` após 500ms.
4.  As projeções são atualizadas no banco e no Redis local.

## 🌐 Testando Multi-Tenancy (Subdomínios)

Para testar subdomínios sem alterar seu arquivo hosts, utilize o domínio `localtest.me` (que resolve para 127.0.0.1):

- **Tenant A:** `http://tenantA.localtest.me:3000/onboarding`
- **Tenant B:** `http://tenantB.localtest.me:3000/onboarding`

Certifique-se de que a variável `NEXT_PUBLIC_APP_DOMAIN` no seu `.env` esteja configurada como `localtest.me:3000`.

## 🗄️ Inspecionando o Banco de Dados

Use o Prisma Studio para ver os eventos e as projeções em tempo real:
```bash
npx prisma studio
```
