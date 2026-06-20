# Funcionamento do Event Bus & Event Sourcing

O **Event Bus** é o sistema circulatório da nossa aplicação, responsável por propagar fatos ocorridos na `EventStore` para o resto do sistema (Projeções, Cache, Webhooks).

## 🔄 O Ciclo de Vida de um Evento

1.  **Comando Despachado:** Uma API Route chama um Command Handler (ex: `ExecuteAgentCommandHandler`).
2.  **Persistência Imutável:** O Handler valida a regra e chama `EventStore.append(event)`.
    - O evento é gravado na tabela `EventStore` no Postgres (Neon).
    - O Neon RLS garante que o evento pertence ao tenant correto.
3.  **Publicação no Bus:** Imediatamente após a gravação bem-sucedida, o `EventStore` publica o evento no `EventBus`.
4.  **Processamento de Projeções:**
    - **Read Models:** O `AgentProjectionHandler` escuta `AgentCreated` e cria um registro na tabela `Agent` (tabela de leitura).
    - **Edge Cache:** O `QuotaEventHandler` escuta `QuotaExceeded` e atualiza o **Upstash Redis** na Borda.
5.  **Side Effects:** Outros sistemas podem assinar o bus para disparar emails, webhooks externos ou logs de auditoria.

## 🛠️ Como Adicionar um Novo Evento

1.  Defina o tipo do evento em `src/modules/[domain]/events/`.
2.  Adicione a lógica de publicação no seu Command Handler.
3.  Crie um novo arquivo ou adicione um `subscribe` em `src/modules/[domain]/projections/` para reagir ao evento.

## ⚡ Performance
O `EventBus` executa os handlers em paralelo utilizando `Promise.all`. Como as projeções são assíncronas em relação ao comando principal, a latência percebida pelo usuário final para operações de escrita é minimizada.
