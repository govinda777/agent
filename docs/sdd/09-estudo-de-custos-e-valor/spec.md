# 9. Estudo de Custos e Proposta de Valor

Para garantir que a plataforma multi-tenant não seja apenas tecnicamente robusta, mas financeiramente viável, este módulo detalha a arquitetura de precificação. O objetivo é assegurar as margens clássicas do mercado SaaS (Software as a Service), tipicamente superiores a 70%.

## 9.1 Estudo de Custos (COGS - Cost of Goods Sold)

Os custos da plataforma dividem-se em dois eixos principais:

### Custos Fixos de Infraestrutura (Escaláveis)

Esta é a base para sustentar a plataforma ativa, diluída entre todos os utilizadores.

* **Hospedagem e API Core:** Vercel (Next.js) - *~$20/mês* (Plano Pro base).

* **Banco de Dados Relacional:** Neon (PostgreSQL) - *~$0 a $19/mês* (Baseado em uso).

* **Banco de Dados Vetorial (RAG):** Pinecone - *~$0 a $70/mês* (Começa no free tier serveless, escala para índices pagos conforme o volume).

* **Autenticação:** Privy - Gratuito até volumes altíssimos.

### Custos Variáveis (O "Hot Path")

Aqui reside o verdadeiro custo marginal por cliente. Deve ser controlado rigorosamente através das quotas do plano.

* **Governança:** Helicone AI - *~$20 a $50/mês* (Preço por volume de requisições).

* **Consumo de Tokens (Provedor LLM):** OpenAI / Mistral.
  * *Exemplo Mistral-Small ou GPT-4o-Mini:* ~US$ 0.15 por 1M de tokens de output.
  * O custo médio mensal em tokens de LLM para um pequeno negócio com 1.000 chats de atendimento não deve ultrapassar **~US$ 1.00 a US$ 3.00**.

**Conclusão de Custo:** O custo real direto (Compute + IA) para sustentar 1 agente de pequeno porte é extremamente baixo (cerca de R$ 5,00 a R$ 15,00/mês por tenant). O valor é gerado pela inteligência, facilidade de uso e abstração técnica que a nossa plataforma oferece.

## 9.2 Estudo de Valor (Willingness to Pay)

A definição de preço baseia-se na "disposição a pagar" de diferentes avatares (personas) que sofrem por não terem automação.

### Perfil A: O Micro / Pequeno Negócio (Starter)

* **Perfil:** Clínicas pequenas, lojas de Instagram, corretores imobiliários.

* **A Dor:** Passam o dia a responder a mensagens no WhatsApp. Perdem leads (e vendas) quando não respondem rápido fora do horário comercial.

* **Disposição a Pagar:** **R$ 97,00 a R$ 147,00 / mês** (ou ~$29).

* **Proposta de Valor:** "O seu negócio aberto 24/7. Nunca mais perca uma venda por demorar a responder."

* **Rentabilidade:** Com um custo de infraestrutura de ~R$ 10, a margem de lucro deste utilizador ronda os **90%**.

### Perfil B: Médias Empresas / Agências (Pro)

* **Perfil:** E-commerces com volume médio, clínicas com múltiplos profissionais, agências de marketing a revender serviços.

* **A Dor:** Precisam de RAG (responder com base em centenas de PDFs de produtos), agendamentos integrados (Tools) e múltiplos agentes isolados para diferentes departamentos.

* **Disposição a Pagar:** **R$ 497,00 a R$ 997,00 / mês** (ou ~$99 a $199).

* **Proposta de Valor:** "Automatize o seu suporte Nível 1 inteiro com o conhecimento exclusivo da sua empresa."

* **Rentabilidade:** Estes clientes consomem mais Pinecone e Tokens. Custos estimados em ~R$ 50/mês. Margem de lucro de **85% a 90%**.

### Perfil C: Enterprise / Custom

* **Perfil:** Grandes retalhistas, seguradoras, redes de saúde.

* **A Dor:** Precisam de fluxos complexos, integrações com ERPs legados, e não querem os seus dados no OpenAI público (exigem instâncias Azure ou LLMs locais restritas).

* **Disposição a Pagar:** **Setup fee (R$ 5.000+) + R$ 2.000+ / mês**.

* **Proposta de Valor:** Soluções de alta segurança feitas à medida usando a nossa engine e SLA dedicado.

## 9.3 Aplicação Estratégica

A plataforma será estruturada para empurrar a adoção do **Perfil A** com um "Self-Service Onboarding" sem atrito (baixa interação humana da nossa equipa), enquanto os Planos Pro atuarão como principal alavanca de receita recorrente sólida.
