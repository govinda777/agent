# Plano Tático - Canais Externos e Segurança

- [ ] **Passo 1: Rota Omnichannel Dinâmica**
  - [ ] Consolidar um middleware/rota global `POST /api/channel-webhook`.
  - [ ] O Payload deve abstrair o tipo (ex: `{ source: 'whatsapp', phone: '+5511', msg: 'Ola' }`).
- [ ] **Passo 2: Webhooks (Meta/WhatsApp)**
  - [ ] Configurar validação do webhook (Challenge/Verify Token) exigido pela API do Facebook/WhatsApp.
  - [ ] Deserializar mensagens de texto enviadas pelo WhatsApp e disparar chamada para a `API_Chat` interna, retornando o resultado.
- [ ] **Passo 3: Segurança (RLS e Prompts)**
  - [ ] Configurar verificações nas rotas `/api/*`: O usuário X só pode visualizar/deletar Agentes que possuam `tenant_id` igual ao ID decodificado do seu Token JWT.
  - [ ] Sanitizar inputs de usuário contra injeções. O `System Prompt` do Tenant deve ficar encapsulado exclusivamente no Bloco de "Instruções do Sistema" da LLM.
