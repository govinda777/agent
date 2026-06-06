# Plano Tático - Motor de IA e RAG

- [ ] **Passo 1: Setup do RAG/Pinecone**
  - [ ] Instalar as bibliotecas (`@pinecone-database/pinecone`, `@langchain/pinecone`).
  - [ ] Criar utilitário `src/lib/pinecone.ts` de conexão.
- [ ] **Passo 2: Rota de Ingestão de Documentos**
  - [ ] Criar rota `POST /api/knowledge/ingest`.
  - [ ] Ler o arquivo recebido pelo Upload da UI e fatiar o documento usando o `RecursiveCharacterTextSplitter`.
  - [ ] Gerar os embeddings usando `OpenAIEmbeddings`.
  - [ ] Fazer Upsert no Pinecone *obrigando a injetar o ID do Agente como Namespace*.
- [ ] **Passo 3: Rota Core de Conversa com Agent Executor**
  - [ ] Modificar `POST /api/chat` para usar `createOpenAIFunctionsAgent` e `AgentExecutor`.
  - [ ] Injetar a `PineconeStore` formatada como "Tool" de busca.
  - [ ] Forçar o filtro do Retriever de contexto a usar o Namespace do Agente.
