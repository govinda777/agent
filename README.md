# Multi-Tenant AI Agent Platform: Governance, Authentication, and Quotas
## 1. Technology Stack
 * **User Authentication (Dashboard):** Privy (Identity provider for tenant owners to manage accounts).
 * **LLM Gateway & Governance:** Helicone (Managed proxy for routing, token tracking, budget limits, and API Key Vault).
 * **Persistent Storage (Metadata & Billing Sync):** Neon (PostgreSQL).
 * **Billing Engine (Optional/Recommended):** Stripe Metered Billing (For automated end-of-month invoicing).
*(Nota: Upstash Redis e Vercel AI Gateway foram completamente removidos da stack).*
## 2. API Gateway & Usage Governance
To ensure a secure and scalable multi-tenant environment without infrastructure overhead, we delegate API routing and financial governance to Helicone.
### API Gateway Strategy (The "Virtual Key" Model)
Instead of managing raw Mistral/OpenAI keys or building custom middleware, the platform utilizes **Helicone Vault**:
 1. The platform holds a **Master LLM Key** (e.g., Mistral API Key) stored securely inside Helicone.
 2. For each tenant, the system generates a **Helicone Virtual Key** via API.
 3. Client applications send requests directly to the Helicone Proxy URL using their Virtual Key. Helicone masks the Master Key and forwards the request to the LLM.
### Billing & Quota Strategy (The "Managed Budget" Model)
We avoid custom Redis state management by leveraging Helicone's native budget enforcement:
 * **The "Hot Path" (Real-time Validation & Blocking):**
   * When creating the Virtual Key via Helicone's API, the system sets a max_budget (e.g., $20.00/month) and a rate_limit.
   * As requests flow through, Helicone automatically counts tokens, calculates the cost, and deducts it from the budget.
   * If the budget is exceeded, Helicone automatically rejects the request at the edge with a 429 Too Many Requests or 402 Payment Required, without our backend executing a single line of code.
 * **The "Cold Path" (Auditing/Billing):**
   * Helicone stores all request logs, token usage, and costs.
   * A daily/weekly cron job pulls aggregated usage from Helicone's API and saves it to Neon for historical records, OR pushes the usage events directly to Stripe to charge for overages.
## 3. Governance Schema (Neon/PostgreSQL)
The database schema is vastly simplified since it no longer needs to track real-time balances in cents.
```sql
-- Tenant Management
CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    helicone_key_id TEXT UNIQUE NOT NULL, -- Reference to the key in Helicone Vault
    monthly_budget_limit_cents BIGINT DEFAULT 2000, -- e.g., $20.00 limit
    is_active BOOLEAN DEFAULT TRUE
);

-- Financial Auditing (Synced periodically from Helicone for history)
CREATE TABLE monthly_usage_summaries (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(tenant_id),
    billing_month DATE NOT NULL,
    total_tokens_consumed BIGINT,
    total_cost_cents INT,
    synced_at TIMESTAMP DEFAULT NOW()
);

```
## 4. Competitive Advantage: Authentication vs. Authorization
 * **Privy:** Responsible for **Identity**. It ensures your customers can log into your dashboard, view their agent configurations, and manage their payment methods.
 * **Helicone Virtual Keys:** Responsible for **Authorization & Economics**. It acts as the gatekeeper, ensuring the customer's agent application can only interact with the LLM within the financial boundaries you established, while providing out-of-the-box observability.
 * **Helicone Customer Portal (Bonus):** We can embed Helicone's pre-built usage dashboards directly into our frontend via iframe, giving tenants full transparency over their token consumption without building UI graphs from scratch.
## 5. Next Steps
 1. **Helicone Setup:** Create a Helicone account, deposit the Master Provider API Key (e.g., Mistral), and test the Vault Virtual Key generation via REST API.
 2. **Agent Integration:** Update the agent's "shell" to point its baseURL to [https://oai.helicone.ai/v1](https://oai.helicone.ai/v1) and use the generated Virtual Key instead of a direct provider key.
 3. **Customer Dashboard:** Build the "Create Agent" flow where the backend generates the Helicone key, saves the reference in Neon, and displays it to the user once.
 4. **Billing Sync:** Implement a web-hook or a nightly cron job to pull usage from Helicone to Neon, or send the usage events directly to Stripe for end-of-month invoicing.
