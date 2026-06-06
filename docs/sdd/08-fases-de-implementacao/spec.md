# 8. Fases de Implementação e Estratégia de Lançamento (MVP)

A construção de uma plataforma multi-tenant de agentes de IA é complexa. Para garantir um "Time-to-Market" (tempo de chegada ao mercado) agressivo e validar o modelo de negócio rapidamente, o desenvolvimento seguirá uma abordagem iterativa.

A estratégia principal do MVP é postergar o desenvolvimento do motor próprio de IA (LangChain/Helicone/Pinecone) e utilizar uma arquitetura de Proxy para o **n8n** na primeira versão.

## 8.1 Fase 1: O "Go-Live" Acelerado (MVP)

Esta fase foca em ter a "vitrine" a funcionar, capturar clientes e entregar um serviço funcional usando uma infraestrutura de backend simplificada.

### 1. Hotsite (Vitrine)

* **Objetivo:** Uma Landing Page focada em conversão, explicando a proposta de valor ("Crie o seu agente de IA em minutos e conecte aos seus canais").

* **Componentes:** Hero section, explicação visual de como funciona, tabela de preços (Tiers) e botões de Call-to-Action (CTA).

### 2. Autenticação e Checkout

* **Onboarding:** Ao clicar em "Começar", o utilizador entra no fluxo do Privy (Login simples/Passwordless).

* **Checkout:** Imediatamente após criar a conta (ou após testar um fluxo gratuito limitado), o utilizador é redirecionado para o Stripe Checkout para subscrever o plano.

### 3. Área Logada (Dashboard Inicial)

* Um painel limpo onde o utilizador (Tenant Owner) pode gerir o seu perfil e visualizar a sua subscrição.

* **Módulo de Agentes:** Uma lista simples dos agentes criados.

### 4. Criação de Agente v1 (A Abordagem n8n)

* **O Atalho:** Nesta fase, a plataforma não processará a IA nativamente. Ao criar um agente, a UI solicitará apenas:
  * Nome do Agente.
  * Canal de Saída (Ex: Token do WebWidget ou integração básica).
  * Webhook URL do n8n (Onde o fluxo real está montado).
  * Auth Token do n8n (Para segurança da chamada).

* **O Fluxo de Execução:** Quando um cliente final envia uma mensagem no WebWidget, a nossa API Next.js recebe, procura as credenciais n8n encriptadas na tabela `tenant_integrations` (conforme especificado no módulo de segurança), e encaminha o payload (Proxy) para o servidor n8n. O n8n processa a IA e devolve a resposta para a nossa API, que a entrega ao cliente final.

## 8.2 Fase 2: Transição para o Motor Interno (In-house Core)

Assim que o MVP estiver a gerar receita e o modelo de negócio estiver validado, a dependência do n8n começará a ser substituída pela arquitetura escalável desenhada inicialmente.

### 1. Configuração Nativa do Agente

O Dashboard ganha novas secções na edição do agente:

* **System Prompt Builder:** Interface para definir o comportamento do agente.

* **RAG / Knowledge Base:** Upload de PDFs e documentos (Integração com Pinecone).

* **Tools:** Seleção de ferramentas nativas (Web Scraper, Google Calendar, etc.).

### 2. Motor LangChain

O backend (Next.js `/api/chat`) deixa de fazer proxy para o n8n e passa a invocar o `AgentExecutor` do LangChain internamente, conectando-se diretamente aos provedores de LLM.

## 8.3 Fase 3: Governança, Analytics e Gestão Financeira

Com o motor próprio a rodar, a proteção de custos torna-se crítica.

### 1. Integração com Helicone (AI Gateway)

* Todas as chamadas de LLM passam a exigir a emissão de Virtual Keys.

* Aplicação estrita dos limites (Rate Limits e Quotas de Tokens) definidos nos planos do Stripe.

### 2. Gestão Financeira no Dashboard

* O Tenant Owner passa a ter gráficos de consumo em tempo real no Dashboard.

* Alertas de limite de quota e opções de "Top-up" (comprar mais tokens pontualmente) via Stripe.
