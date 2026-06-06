# Plano Tático - Jornadas de Usuário (UI/UX)

Este plano materializa os fluxos desenhados nas jornadas End-to-End para tarefas técnicas.

- [ ] **Passo 1: Onboarding e Subscrição Inicial**
  - [ ] Implementar a página de Landing Page pública (`/`).
  - [ ] Integrar botão genérico de Autenticação (`Privy`).
  - [ ] Ao ocorrer `onSuccess` do Privy, bater na rota `/api/auth/sync` (upsert do utilizador no Neon e verificar subscrição).
  - [ ] Criar a página de Tiers `/pricing` e o fluxo que chama o Stripe Checkout API com retorno para `/success`.

- [ ] **Passo 2: Dashboard e Criação do Agente**
  - [ ] Criar o componente de Layout Logado (Sidebar e proteção RLS de navegação).
  - [ ] Criar Ecrã do Wizard (Step-by-Step): `1. Configuração Base` -> `2. RAG/Upload` -> `3. Finalização e Integrações`.
  - [ ] Ao terminar o Wizard, acionar a API de Helicone Virtual Keys antes de exibir a tag final do WebWidget.

- [ ] **Passo 3: Módulo de Suspensão de Inadimplência**
  - [ ] Adicionar um Interceptor/Wrapper global na aplicação de frontend para ler a claim `is_active` ou `status` da subscrição.
  - [ ] Renderizar o componente global de Banner de Suspensão com link de Stripe Customer Portal se o status for inativo.
  - [ ] Confirmar implementação na API de Webhooks do backend as chamadas sincronizadas de pausa ao Helicone API.
