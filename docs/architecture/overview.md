# Visão Geral da Arquitetura

Este documento descreve a arquitetura do sistema de chatbot com Retrieval Augmented Generation (RAG) construído com Next.js, Pinecone e Vercel AI SDK.

## Diagrama de Componentes (C4)

```mermaid
graph TB
    subgraph Browser
        UI[Chat UI<br/>React Components]
    end

    subgraph Next.js App
        CR[/api/crawl<br/>Route]
        CH[/api/chat<br/>Route]
        CT[/api/context<br/>Route]
        IG[/api/ingest<br/>Route]
    end

    subgraph External Services
        PC[(Pinecone<br/>Vector DB)]
        OAI[OpenAI API]
    end

    UI -->|useChat hook| CH
    UI -->|POST crawl| CR
    UI -->|POST context| CT
    UI -->|POST ingest| IG

    CR -->|embed & upsert| PC
    CR -->|embeddings| OAI

    IG -->|embed & upsert| PC
    IG -->|embeddings| OAI

    CH -->|query vectors| PC
    CH -->|chat completion| OAI

    CT -->|query vectors| PC
```

## Stack Tecnológica

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Runtime**: Node.js & Edge Functions
- **Vector Database**: [Pinecone](https://www.pinecone.io/)
- **LLM**: OpenAI (GPT-4o, GPT-3.5-turbo)
- **SDK**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Testing**: [Playwright](https://playwright.dev/)

## Padrões Arquiteturais

- **Padrão RAG (Retrieval Augmented Generation)**: O sistema não depende apenas do conhecimento prévio do modelo, mas recupera informações relevantes de uma base de conhecimento vetorial para gerar respostas mais precisas e contextuais.
- **Streaming Responses**: Utiliza Server-Sent Events (SSE) através do Vercel AI SDK para fornecer respostas em tempo real, melhorando a percepção de performance do usuário.
- **Busca Semântica**: Utiliza embeddings vetoriais para encontrar documentos por significado, não apenas por palavras-chave.

## Fluxo de Dados

### 1. Indexação (Seeding / Ingest)
- O conteúdo é extraído de URLs (crawling) ou arquivos (PDF, TXT, MD).
- O texto é dividido em pedaços (chunks) menores e semanticamente coerentes.
- Cada chunk é convertido em um vetor de 1536 dimensões usando o modelo de embedding da OpenAI.
- Os vetores e seus metadados são armazenados no Pinecone.

### 2. Recuperação e Geração (Chat)
- A pergunta do usuário é convertida em um vetor de embedding.
- O Pinecone busca os vetores mais similares (Top-K) na base de conhecimento.
- Os chunks de texto correspondentes são recuperados e inseridos no prompt do sistema como contexto.
- O LLM (OpenAI) gera uma resposta baseada estritamente no contexto fornecido.
- A resposta é transmitida via stream para o frontend.
