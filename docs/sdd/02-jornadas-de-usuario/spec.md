# 2. Jornadas de Usuário e UI/UX

Para garantir que a plataforma tenha uma adoção suave, a experiência do usuário (UX) focará em clareza, feedbacks imediatos e processos "Self-Service". Esta seção define as jornadas do ponto de vista do **Tenant Owner** (o assinante da plataforma).

## 2.1 Jornada de Onboarding

**Objetivo:** Permitir que um novo cliente se cadastre, pague a assinatura e obtenha acesso à criação de agentes no menor tempo possível.

1. **Acesso e Registro:**
   * O cliente acessa o site comercial e clica em "Começar Agora".
   * A integração com **Privy** exibe um modal amigável (suportando Social Logins, Google, Apple ou Passwordless via e-mail).
   * Após a validação, a conta é provisionada com status pendente.

2. **Escolha de Planos (Checkout):**
   * O usuário é redirecionado para a tela de Planos (Tiers). Ele seleciona a oferta (ex: Plano Básico, Pro, ou Enterprise).
   * Inicia-se o fluxo com o **Stripe Checkout**.
   * Ao finalizar o pagamento, a plataforma recebe o Webhook de sucesso, atualiza o status no **Neon DB** (PostgreSQL) e o usuário ganha acesso ao Dashboard principal.

## 2.2 Jornada de Criação do Agente

**Objetivo:** Guiar o Tenant na configuração do "cérebro" de sua IA e no seu comportamento, sem a necessidade de habilidades técnicas de programação.

1. **Definição de Perfil:**
   * O usuário navega para a página `Meus Agentes` e clica em `Criar Novo Agente`.
   * Ele define informações primárias: *Nome do Agente*, *Descrição*, e *System Prompt* (ex: "Você é um atendente da loja X focado em vendas amigáveis").

2. **Injeção de Base de Conhecimento (RAG/Pinecone):**
   * Tela de **Upload de Documentos**: O usuário arrasta PDFs, arquivos TXT ou insere uma URL de site.
   * *Ação do Sistema:* O backend processa o arquivo, fatia o texto (chunks) e faz o "Ingest" gravando os dados no banco vetorial Pinecone, em um *namespace exclusivo* vinculado ao ID do Agente.
   * Feedback visual é essencial: Barras de progresso e indicativo de "Documento Indexado com Sucesso".

3. **Configuração de Ferramentas e Funcionalidades (Tools):**
   * De acordo com o Plano Assinado, checkboxes são exibidas.
   * O Tenant habilita ferramentas que o agente deve usar: ex: `[x] Agendamento de Reuniões`, `[x] Consulta de Estoque`, `[x] Web Scraper`.

4. **Implantação (Deployment):**
   * O usuário finaliza a configuração e o backend gera automaticamente uma **Chave Virtual do Helicone (Virtual Key)** em background.
   * A plataforma retorna links de integração prontos para uso: "URL do seu Webchat", ou instruções para "Conectar WhatsApp".

## 2.3 Jornada de Analytics e Monitoramento

**Objetivo:** Proporcionar visibilidade total sobre como a IA está sendo usada e quão perto o usuário está do teto do plano dele.

1. **Visão Geral do Consumo (Dashboard):**
   * Tela principal exibe KPIs: *Total de Interações Hoje*, *Tokens Consumidos no Mês*, *Economia vs Plano*.
   * Os gráficos exibidos no dashboard consumirão iFrames nativos ou dados da API analítica provida pelo **Helicone** para desenhar o consumo.

2. **Histórico de Conversas (Log View):**
   * O Tenant Owner pode acessar a "Caixa de Entrada" ou "Logs".
   * Ele consegue ler as conversas reais que os clientes dele tiveram com o agente para avaliar a qualidade e ajustar o *System Prompt* se necessário.

3. **Notificações de Limites (Alertas UX):**
   * Quando o consumo do usuário atinge 80% do pacote mensal de tokens, a plataforma exibe um *banner de alerta laranja* sugerindo um upgrade.
   * Se o limite bater 100% (e não houver cobrança extra autorizada), o agente congela e o painel acusa: *"Cota de requisições excedida. Atualize seu plano para continuar atendendo"*.
