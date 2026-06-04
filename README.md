Multi-Tenant AI Agent Platform: Governance, Authentication, and Quotas

1. Technology Stack

User Authentication (Dashboard): Privy (Identity provider for tenant owners to manage credits and logs).

API Authentication: Managed API Keys (Stored in Neon).

API Gateway: Vercel AI Gateway (Routing, rate limiting, and security).

Hot Storage (Quotas/Cache): Upstash Redis (Serverless).

Cold Storage (Billing/Audit): Neon (PostgreSQL).

2. API Gateway & Usage Governance

To ensure a secure and scalable multi-tenant environment, we implement a centralized governance layer.

API Gateway Strategy

All requests from client applications must pass through the Vercel AI Gateway. This layer:

Validates the x-api-key in the header.

Identifies the tenant_id associated with that key.

Performs a real-time check against the Upstash Redis cache for the current available_credits.

Billing & Quota Strategy (The "Credit-based Model")

We avoid manual API key management by implementing a unit-based billing system:

Pre-paid/Usage-based Credits: Each tenant purchases a credit pack (e.g., $1.00 equivalent).

The "Hot Path" (Validation):

Before forwarding the request to Gemini, the middleware performs a GET operation in Redis to verify if available_credits > 0.

If available_credits <= 0, the Gateway rejects the request with a 402 Payment Required status.

The "Cold Path" (Auditing/Billing):

After the LLM response is streamed, the system calculates the token cost.

An asynchronous process performs a DECRBY operation in Redis to update the tenant's balance.

Data is synced periodically to Neon (PostgreSQL) for financial auditing and permanent records.

3. Governance Schema (Neon/PostgreSQL)

-- Tenant Management
CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    api_key_hash TEXT UNIQUE NOT NULL, -- Hashed key for auth
    balance_cents BIGINT DEFAULT 100,  -- Credit balance
    is_active BOOLEAN DEFAULT TRUE
);

-- Financial Auditing (Syncs from Redis)
CREATE TABLE billing_logs (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(tenant_id),
    tokens_consumed BIGINT,
    cost_cents INT,
    recorded_at TIMESTAMP DEFAULT NOW()
);


4. Competitive Advantage: Authentication vs. Authorization

Privy: Responsible for Identity. It ensures your customers (store owners) can manage their accounts, view logs, and buy credits securely in your dashboard.

API Keys: Responsible for Authorization. It allows your customers' applications to interact with your AI agent service in a headless (server-to-server) fashion, protected by your Gateway's rate limits and quota checks.

5. Next Steps

Implement Gateway Middleware: Configure Vercel AI Gateway to authenticate keys against the tenants table.

Billing Cron: Set up a worker to sync Redis usage to billing_logs in Neon every 5 minutes.

Credit Management: Build the /api/credits/topup endpoint, triggered by the dashboard (authenticated via Privy).
