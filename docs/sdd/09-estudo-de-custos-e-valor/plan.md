# Plano Tático - Precificação e Implementação Comercial

Este plano foca na configuração dos sistemas externos para refletir a estratégia financeira definida.

- [ ] **Passo 1: Setup do Stripe (Tiers de Produto)**
  - [ ] Aceder ao Stripe Dashboard e criar o Produto "Starter".
  - [ ] Adicionar um preço recorrente mensal (Ex: R$ 97,00 ou $29,00).
  - [ ] Criar o Produto "Pro" com preço recorrente mensal (Ex: R$ 497,00 ou $99,00).
  - [ ] Copiar os `price_id` gerados para o ficheiro `.env` do projeto Next.js.

- [ ] **Passo 2: Configuração de Limites no AI Gateway (Helicone)**
  - [ ] Mapear o teto máximo de tokens (Budget) para o Plano Starter. O bloqueio (HTTP 429) deve acontecer estritamente caso o utilizador atinja um custo aproximado de $2,00 a $3,00 para proteger a margem de 90%.
  - [ ] Garantir que o Plano Pro tem limites mais altos definidos programaticamente via Helicone Node SDK.

- [ ] **Passo 3: Alinhamento de Produto e Marketing (Landing Page)**
  - [ ] Na Landing Page do MVP (Sprint 1), ajustar a "Tabela de Preços" para espelhar as Personas.
  - [ ] Escrever os "Features/Benefícios" baseados nas dores mapeadas (Ex: "Atendimento 24h", "Agendamento por IA").
  - [ ] Limitar o UI do Dashboard: Esconder opções de RAG (Base de Conhecimento) para clientes que assinaram o pacote Starter.
