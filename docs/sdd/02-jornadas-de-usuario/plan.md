# Plano Tático - Jornadas de Usuário (UI/UX)

- [ ] **Passo 1: Telas de Onboarding / Autenticação**
  - [ ] Criar página de Landing (`/`).
  - [ ] Integrar botão de login chamando o hook `usePrivy()`.
  - [ ] Criar a rota de Callback pós-login para verificar se o usuário existe no DB Neon e registrar se for novo.
- [ ] **Passo 2: Dashboard Principal**
  - [ ] Criar o Layout do Dashboard (Sidebar, Header logado).
  - [ ] Criar página `Meus Agentes` listando Agentes do Tenant (fazer mock dos dados primeiro).
- [ ] **Passo 3: Fluxo de Criação do Agente**
  - [ ] Criar a UI de formulário: `Nome`, `Descrição` e `System Prompt`.
  - [ ] Criar componente de Upload (Drag n' Drop) para base de conhecimento.
  - [ ] Criar lista de checkboxes das Ferramentas (Tools).
- [ ] **Passo 4: Integração de Analytics (Visual)**
  - [ ] Criar componentes de "Cards" com consumo de tokens e limite de quotas.
  - [ ] Adicionar lógica de Banner (Aviso Amarelo/Vermelho) simulando limite atingido na interface.
