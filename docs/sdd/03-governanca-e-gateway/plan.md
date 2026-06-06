# Plano Tático - Governança e API Gateway

- [ ] **Passo 1: Setup Helicone Client**
  - [ ] Configurar variáveis de ambiente do `HELICONE_API_KEY`.
  - [ ] Criar utilitário `src/lib/helicone.ts` para abstrair as chamadas da API Enterprise do Helicone.
- [ ] **Passo 2: Geração Dinâmica de Chaves Virtuais**
  - [ ] Criar endpoint `POST /api/agents` (quando o UI enviar o form de Criação).
  - [ ] No backend, efetuar request ao Helicone para criar a *Virtual Key* com os limites de custo e taxa (`max_budget`).
  - [ ] Receber o ID da *Virtual Key* e associar ao Agente recém criado no banco Neon.
- [ ] **Passo 3: O "Hot Path" (Roteamento de Inferência)**
  - [ ] Configurar a BaseURL do LangChain/OpenAI Client na API de Chat para apontar obrigatoriamente para `https://oai.helicone.ai/v1`.
  - [ ] Adicionar os Headers exigidos do Helicone (`Helicone-Auth: Bearer {VIRTUAL_KEY}`).
- [ ] **Passo 4: Sincronização do "Cold Path"**
  - [ ] Criar rota simulada de Cronjob (`GET /api/cron/sync-usage`).
  - [ ] Implementar loop que busca uso de tokens via Helicone e atualiza no modelo de banco do Tenant.
