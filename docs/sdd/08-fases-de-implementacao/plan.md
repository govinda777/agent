# Plano Tático - Fases de Implementação e Lançamento

Este plano atua como um mapa de Produto (Roadmap), priorizando o que deve ser desenvolvido primeiro para atingir o MVP o mais rápido possível.

## SPRINT 1: Fundação e MVP (Fase 1)

- [ ] **Passo 1: Vitrine e Autenticação**
  - [ ] Desenvolver a Landing Page estática (`/`).
  - [ ] Configurar o componente PrivyProvider e botão de Login.
  - [ ] Criar sincronização Privy -> Prisma (Model `Tenant`).
- [ ] **Passo 2: Gestão de Assinatura (Stripe Base)**
  - [ ] Criar produtos de Tiers de Planos no Dashboard do Stripe.
  - [ ] Integrar redirecionamento para o Stripe Checkout via `/api/checkout`.
  - [ ] Escutar Webhook `checkout.session.completed` para liberar o Dashboard.
- [ ] **Passo 3: Cofre e Agentes (A Abordagem n8n)**
  - [ ] Criar a tabela `tenant_integrations` e módulo Crypto AES-GCM (Conforme SDD 07).
  - [ ] Criar tela UI: "Meus Agentes -> Criar Agente".
  - [ ] O form deve solicitar *Nome*, *N8N_WEBHOOK_URL* e *N8N_AUTH_TOKEN*.
  - [ ] Criptografar as credenciais N8N e salvar na `tenant_integrations`.
- [ ] **Passo 4: Rota Proxy de Chat**
  - [ ] Criar rota em Next.js `/api/chat`.
  - [ ] Descriptografar a chave N8N do Tenant no tempo de execução.
  - [ ] Enviar request `fetch` HTTP direto ao Webhook do n8n do cliente.
  - [ ] Retornar o payload de volta para a ponta/webwidget.

---

## SPRINT 2: Transição para Motor In-House (Fase 2)

> A ser executado após o MVP gerar receita

- [ ] **Passo 1: UI do Construtor de Agente**
  - [ ] Implementar a página com o System Prompt textarea.
  - [ ] Implementar o upload de PDF/TXT.
  - [ ] Implementar lista visual (toggles) das Tools Langchain disponíveis.
- [ ] **Passo 2: Motor Langchain Core e Pinecone**
  - [ ] Criar rota `/api/knowledge/ingest` que envia chunks para o Pinecone.
  - [ ] Atualizar a rota `/api/chat` para deixar de chamar o n8n.
  - [ ] Passar a instanciar o `AgentExecutor` e invocar a provedora nativamente.

---

## SPRINT 3: Scale e Governança (Fase 3)

- [ ] **Passo 1: Governança do Helicone**
  - [ ] Substituir a Key da provedora pelas Virtual Keys geradas dinamicamente via Helicone API.
  - [ ] Vincular a Virtual Key associada aos limites do Tier do Cliente.
- [ ] **Passo 2: Dashboards Visuais**
  - [ ] Extrair dados do Helicone e preencher gráficos de "Consumo de Tokens" para o cliente na sua dashboard UI.
