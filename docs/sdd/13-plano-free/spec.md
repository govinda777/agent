# 13. Plano Free (Product-Led Growth)

Como estratégia principal de aquisição no MVP, a plataforma adota o modelo **Product-Led Growth (PLG)**. O objetivo é permitir que o utilizador experimente o valor da plataforma (Aha Moment) antes de lhe ser exigido qualquer pagamento.

## 13.1 O Fluxo da Jornada do Utilizador

1. **Registo Imediato:** O utilizador entra no Hotsite, clica em "Começar" e faz login via Privy. Nenhum cartão de crédito é exigido nesta fase.
2. **Dashboard (Onboarding):** Aterra no Dashboard, onde um banner indicativo lhe diz claramente os limites atuais (ex: "Tem 7 dias de teste e 1.000 mensagens").
3. **Aha Moment:** Ele cria o seu primeiro agente, interage com o widget e vê a IA a funcionar.
4. **Paywall Contextual:** Quando o utilizador tenta ultrapassar um limite (ex: tentar criar um segundo agente, ou ativar o WhatsApp), ou quando os 7 dias expiram, a plataforma apresenta um bloqueio (Paywall) sugerindo o Upgrade.

---

## 13.2 Regras do Plano Gratuito e Configuração via `.env`

Para garantir total flexibilidade, **nenhum limite deve estar "hardcoded" no código**. Todas as restrições do plano gratuito são controladas por Variáveis de Ambiente, permitindo à equipa de negócio ajustar a estratégia de PLG a qualquer momento sem necessitar de um novo deploy.

| Recurso | Variável de Ambiente (`.env`) | Valor Padrão (Default) | Comportamento se ultrapassado |
| :--- | :--- | :--- | :--- |
| **Duração** | `FREE_PLAN_TRIAL_DAYS` | `7` | Chatbots param de responder; bloqueio no Dashboard. |
| **Qtd. Agentes** | `NEXT_PUBLIC_FREE_PLAN_MAX_AGENTS` | `1` | Botão "Novo Agente" bloqueado / API rejeita a criação. |
| **Canais Permitidos** | `NEXT_PUBLIC_FREE_PLAN_CHANNELS` | `web` | Checkboxes de WhatsApp/Instagram bloqueadas. |
| **Qtd. Execuções** | `FREE_PLAN_MAX_EXECUTIONS` | `1000` | Chatbots devolvem mensagem de erro genérica. |

*(Nota: Variáveis iniciadas com `NEXT_PUBLIC_` ficam expostas ao Frontend para desenhar a interface dinamicamente, enquanto as restantes são lidas apenas pelo Backend em segurança).*

---

## 13.3 Como os Bloqueios (Enforcement) são Feitos na Prática?

Para que estes limites sejam verdadeiramente respeitados, as validações ocorrem **sempre do lado do Servidor (Backend / Use Cases)**, com reflexos visuais no Frontend (UI).

### 1. Bloqueio de Criação (Qtd. de Agentes)
* **Como funciona:** Quando o utilizador clica em "Salvar Agente", o Frontend chama a rota `POST /api/agents`.
* **Regra no Backend (`CreateAgentUseCase`):**
  1. O Use Case consulta a base de dados: *Quantos agentes este utilizador já tem?*
  2. Consulta o plano e os limites dinâmicos via `process.env.NEXT_PUBLIC_FREE_PLAN_MAX_AGENTS`.
  3. **Bloqueio:** Se for `FREE` e a contagem for `>=` ao limite definido na variável, o Backend lança um erro HTTP 403 (Forbidden).
* **UI:** O Frontend captura o erro 403 e abre um Modal de Paywall, sugerindo a subscrição do Plano Pro para criar mais agentes.

### 2. Bloqueio de Canais Premium (WhatsApp/Instagram)
* **Como funciona:** O plano Free restringe a saída apenas a integrações Web.
* **UI:** No ecrã de criação de agentes, as checkboxes do WhatsApp e Instagram estão `disabled` (inativas) se a API informar que o plano é Free. Existe uma pequena tag `[PRO]` ao lado dessas opções.
* **Regra no Backend (`CreateAgentUseCase`):** Se por acaso o utilizador tentar forçar a submissão via Postman com `channels: { whatsapp: true }`, o Backend valida o plano e ignora silenciosamente (força para `false`) ou lança um erro 403.

### 3. Bloqueio de Execuções e Prazo (O Motor de Chat)
Este é o bloqueio mais crítico, pois impede que um utilizador que instalou o WebWidget num site público esgote os seus custos.
* **Como funciona:** Sempre que o visitante final de um site escreve uma mensagem no WebWidget, esta mensagem chega à nossa rota proxy `POST /api/agents/[agentId]/chat`.
* **Regra no Backend (`ProcessAgentChatUseCase`):**
  1. O Use Case vai à tabela de utilizadores (`tenants`) e verifica:
     - `trial_ends_at`: A data atual é superior ao fim do período (calculado com base em `process.env.FREE_PLAN_TRIAL_DAYS`)?
     - `executions_used`: O contador atual já chegou a `process.env.FREE_PLAN_MAX_EXECUTIONS`?
  2. Se a resposta for **NÃO**: 
     - Incrementa o contador na base de dados (`executions_used + 1`).
     - Reencaminha (Proxy) a mensagem para o **n8n**.
  3. **O Bloqueio:** Se a resposta for **SIM**:
     - O Use Case **não reencaminha** a mensagem para o n8n. (Poupando processamento).
     - Devolve imediatamente (em menos de 100ms) uma resposta fixa e graciosa para o WebWidget: 
     > *"Aviso: O agente de IA atingiu o seu limite de interações gratuitas ou o seu plano expirou. Por favor, contacte o suporte ou o administrador da plataforma."*
     - Retorna um status HTTP genérico (ex: 200 OK com a mensagem de aviso) para que o WebWidget a desenhe no ecrã como se fosse uma resposta real do bot, mas sem custos LLM para nós.

---

## 13.4 O Fluxo de Liberação (Desbloqueio)

Sempre que o utilizador decide fazer Upgrade (Stripe Checkout):
1. O Stripe envia um Webhook (`invoice.paid`) para o nosso Backend.
2. O Backend atualiza o campo `status` da tabela de Tenant de `'FREE'` para `'ACTIVE'`.
3. Os campos `trial_ends_at` e limites (1000 execuções) deixam de ser validados pelo `ProcessAgentChatUseCase`.
4. Todos os canais (WhatsApp/Instagram) ficam desbloqueados no Frontend, e a barreira de 1 agente é levantada.
