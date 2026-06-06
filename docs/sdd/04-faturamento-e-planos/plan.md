# Plano Tático - Faturamento, Pagamentos e Tiers

- [ ] **Passo 1: Configuração do Stripe SDK**
  - [ ] Instalar Stripe Node (`npm i stripe`).
  - [ ] Registrar produtos e preços no Dashboard oficial do Stripe (Mockar os Price IDs).
- [ ] **Passo 2: Integração de Checkout**
  - [ ] Criar endpoint `POST /api/checkout/create-session` no Next.js.
  - [ ] Vincular o `client_reference_id` com o ID do Tenant do Privy/Neon.
- [ ] **Passo 3: Mapeamento de Webhooks do Stripe**
  - [ ] Criar a rota de Webhook (`POST /api/webhooks/stripe`).
  - [ ] Configurar validação de assinatura (`stripe.webhooks.constructEvent`).
  - [ ] Lidar com evento `checkout.session.completed` (Mudar status do Tenant para PRO).
  - [ ] Lidar com evento `invoice.payment_failed` (Bloquear Tenant, `is_active = false`).
- [ ] **Passo 4: Tiers (Camadas de Planos no UI)**
  - [ ] Criar página de Pricing List visual para escolha de planos antes do roteamento de Checkout.
