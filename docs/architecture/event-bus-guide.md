# Funcionamento do Durable Event Bus & Event Sourcing

Nesta arquitetura 2026, a comunicação entre o domínio de escrita e as projeções é **totalmente assíncrona e resiliente**.

## 🔄 O Ciclo de Vida de um Evento (Durable Flow)

1.  **Comando Despachado:** Uma API Route recebe uma intenção e chama um Command Handler.
2.  **Persistência Síncrona:** O Handler grava o evento na tabela `EventStore` (Postgres/Neon).
    - Esta é a única parte síncrona que bloqueia a resposta da API.
3.  **Despacho para Broker:** O `EventStore` envia o evento para o **Upstash QStash**.
4.  **Resposta Imediata:** A API retorna `201 Created` ou o ID da execução para o usuário final (Latência ultra-baixa).
5.  **Entrega via Webhook:** O QStash faz uma chamada POST para `/api/webhooks/projections`.
    - Se falhar, o broker tenta novamente com exponential backoff.
6.  **Processamento de Projeções:** O Webhook Worker inicializa os Handlers e atualiza:
    - **Read Models:** Tabelas no Postgres para consulta rápida.
    - **Edge Cache:** Upstash Redis para governança na borda.

## ⚖️ Consistência Eventual
O sistema segue o princípio da **Consistência Eventual**. Isso significa que após criar um agente, ele pode levar alguns milissegundos (tempo do webhook) para aparecer na lista. Isso é compensado pela escalabilidade infinita e resiliência a falhas parciais.

## 🛠️ Como Adicionar um Novo Evento
1. Defina o evento em `src/modules/[domain]/events/`.
2. Publique-o no seu Command Handler via `EventStore.append()`.
3. Garanta que o handler de reação esteja registrado no Webhook Worker (`/api/webhooks/projections/route.ts`).
