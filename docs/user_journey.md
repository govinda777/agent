# User Journey Documentation

**Overview**
This document describes the complete user flow for the **Agent Management Platform**, from the initial landing page through checkout and the final post‑purchase dashboard. Each step is numbered to match the flow you provided.

---

## Journey Steps

| # | Page / Screen | Primary Actions | Notes |
|---|---------------|-----------------|-------|
| **0** | **Home** | • Landing page – overview of the product.<br>• Call‑to‑action buttons (Login / Sign‑up). | First impression; should showcase key benefits and branding. |
| **1** | **Login** | • Enter email & password.<br>• “Forgot password?” link.<br>• Successful login redirects to Dashboard. | Validation errors displayed inline; remember‑me option optional. |
| **2** | **Dashboard – List Agents** | • Table or card view of existing agents.<br>• Search / filter by tenant, status, etc.<br>• Buttons: **View / Edit** for each agent. | Acts as the central hub; should load quickly (≈ ≤ 2 s). |
| **2.1** | **Agent Detail (Tenant‑specific)** | • Interaction area to **talk with the agent** (chat UI).<br>• **Edit** button opens the agent editor. | UI may include a history pane, quick‑reply suggestions, and a “Save changes” action. |
| **3** | **Create New Agent** | • Form fields: name, description, tenant, model, initial prompt.<br>• “Create” button → redirects to Dashboard (new agent appears). | Validation for required fields; optional advanced settings (e.g., temperature). |
| **4** | **Checkout** | • Summary of selected plan / credits.<br>• Payment method selection. | Uses Stripe for payment processing. |
| **4.1** | **Stripe Checkout Screen** | • Hosted Stripe page – card entry, 3‑DS, etc.<br>• “Pay” button triggers transaction. | Should be embedded via Stripe Elements or redirect. |
| **4.2** | **Success Screen** | • Confirmation message with receipt ID.<br>• “Go to Dashboard” CTA. | Displays order summary and next‑steps. |
| **4.3** | **Post‑Checkout Dashboard (Read‑Only)** | • Dashboard view **without** “Update” / “Edit” buttons (restricted mode).<br>• Only view agents; cannot modify until subscription is active. | Useful for trial users or after a failed payment; clearly indicate limited access. |

---

## Visual Flow (Mermaid)

```mermaid
flowchart TD
    %% Core flow
    A0[0️⃣ Home] --> A1[1️⃣ Login]
    A1 --> A2[2️⃣ Dashboard (list agents)]

    %% Agent interaction
    A2 --> A2_1[2.1️⃣ Agent Detail (Tenant‑specific)]
    A2_1 -->|Talk with agent| A2_1a[Chat UI]
    A2_1 -->|Edit| A2_1b[Agent Editor]

    %% Create new agent
    A2 --> A3[3️⃣ Create New Agent]

    %% Checkout flow
    A2 --> A4[4️⃣ Checkout]
    A4 --> A4_1[4.1️⃣ Stripe Checkout Screen]
    A4_1 --> A4_2[4.2️⃣ Success Screen]
    A4_2 --> A4_3[4.3️⃣ Post‑Checkout Dashboard (read‑only)]

    %% Styling
    classDef primary fill:#2C3E50,color:#ECF0F1,stroke:#3498DB,stroke-width:2px;
    classDef secondary fill:#34495E,color:#ECF0F1,stroke:#95A5A6,stroke-width:1px;
    class A0,A1,A2,A3,A4 primary;
    class A2_1,A2_1a,A2_1b,A4_1,A4_2,A4_3 secondary;
``` 

### How to Use This Documentation
- **Design & Development** – Follow each numbered step when building UI components or API endpoints.
- **Testing** – Verify that each transition (e.g., Login → Dashboard) works within the performance budget (≤ 2 s).
- **Onboarding & Support** – Use the table above to explain the flow to new users or to troubleshoot where a user might get stuck.

Feel free to let me know if you need more detail on any specific screen (e.g., component hierarchy, API contracts, or copy / UX guidelines).
