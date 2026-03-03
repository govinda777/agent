# Guia de Instalação e Configuração

Este documento detalha o processo de instalação e configuração do ambiente para desenvolvimento e execução.

## Pré-requisitos

- **Node.js**: Versão 18 ou superior instalada.
- **Conta OpenAI**: Uma conta ativa para geração de embeddings e chat (necessária a `OPENAI_API_KEY`).
- **Conta Pinecone**: Uma conta Pinecone ativa para o banco de dados vetorial.

## Passo a Passo

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/govinda777/agent.git
   cd agent
   ```

2. **Instalar Dependências**:
   ```bash
   npm install
   ```

3. **Configurar Variáveis de Ambiente**:
   Copie o arquivo `.env.example` para `.env` e preencha com suas chaves:
   ```bash
   cp .env.example .env
   ```

4. **Variáveis de Ambiente Necessárias**:
   - `OPENAI_API_KEY`: Sua chave de API da OpenAI.
   - `PINECONE_API_KEY`: Sua chave de API do Pinecone.
   - `PINECONE_INDEX`: O nome do índice no Pinecone (ex: `chatbot-knowledge`).
   - `PINECONE_CLOUD`: O provedor cloud (ex: `aws`, `gcp`).
   - `PINECONE_REGION`: A região do índice (ex: `us-east-1`).

5. **Executar em Desenvolvimento**:
   ```bash
   npm run dev
   ```

6. **Acessar a Aplicação**:
   Abra seu navegador em [http://localhost:3000](http://localhost:3000).

---

## [📖 Tutorial de Construção](./tutorial.md)
Se você deseja aprender como construir este sistema do zero, consulte o tutorial passo a passo.

## Estrutura de Pastas

```
/
├── public/          # Ativos estáticos (imagens, ícones)
├── src/
│   ├── app/         # Next.js App Router (Páginas e APIs)
│   │   ├── api/     # Endpoints de API (Chat, Crawl, Ingest)
│   │   ├── components/ # Componentes React
│   │   └── utils/   # Funções utilitárias (Pinecone, OpenAI, etc.)
├── tests/           # Testes End-to-End (Playwright)
└── docs/            # Documentação completa do projeto
```
