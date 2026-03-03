# 🤖 AI Chatbot com RAG (Retrieval Augmented Generation)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-3.3-blue)](https://sdk.vercel.ai/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-green)](https://www.pinecone.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-orange?logo=openai)](https://openai.com/)

Um assistente de chat inteligente construído com Next.js, Pinecone e Vercel AI SDK que utiliza a técnica RAG para fornecer respostas precisas baseadas em contextos reais (sites e arquivos).

## 🚀 Visão Geral

Este projeto permite criar uma base de conhecimento personalizada através de crawling de URLs ou upload de arquivos (PDF, TXT, MD), permitindo que o chatbot responda perguntas baseadas estritamente nessas informações, evitando alucinações e garantindo transparência.

### Principais Funcionalidades

- ✅ **RAG (Retrieval Augmented Generation)**: Respostas contextuais baseadas em dados reais.
- ✅ **Multi-fontes**: Indexação de sites e arquivos locais.
- ✅ **Streaming de Respostas**: Feedback em tempo real para o usuário.
- ✅ **Transparência**: Painel lateral que exibe as fontes de contexto utilizadas.
- ✅ **Performance**: Execução em Edge Functions para baixa latência.

---

## 📖 Documentação Completa

Para um mergulho profundo no sistema, explore as seções da nossa documentação:

### [🏗️ Arquitetura](./docs/architecture/overview.md)
Entenda como o sistema foi desenhado, a stack tecnológica e as [decisões arquiteturais (ADRs)](./docs/architecture/decisions.md) tomadas.

### [🔌 APIs e Contratos](./docs/api/endpoints.md)
Documentação detalhada dos endpoints de chat, crawling, ingestão de arquivos e limpeza de índice.

### [💼 Negócio e Casos de Uso](./docs/business/value-proposition.md)
Veja a [proposta de valor](./docs/business/value-proposition.md) do projeto e descubra [casos de uso práticos](./docs/business/use-cases.md) para diferentes indústrias.

### [🛠️ Operação e Troubleshooting](./docs/operations/setup.md)
Guia completo de [instalação](./docs/operations/setup.md), [monitoramento](./docs/operations/monitoring.md) e [resolução de problemas comuns](./docs/operations/troubleshooting.md).

---

## 🛠️ Guia Rápido de Instalação

### Pré-requisitos
- Node.js 18+
- Chave de API OpenAI
- Chave de API Pinecone

### Setup
```bash
git clone https://github.com/govinda777/agent.git
cd agent
npm install
cp .env.example .env
# Preencha seu .env com as chaves necessárias
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🧪 Testes

O projeto utiliza Playwright para testes de ponta a ponta:

```bash
# Rodar todos os testes
npm run test:e2e

# Ver o último relatório de testes
npm run test:show
```

---

## 📝 Licença

Este projeto está sob a licença [MIT](LICENSE).
