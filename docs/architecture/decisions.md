# ADRs (Architecture Decision Records)

Este documento registra as decisões arquiteturais tomadas durante o desenvolvimento do projeto.

## ADR-001: Escolha do Pinecone como Vector Database

**Contexto**: O sistema precisa armazenar e buscar embeddings eficientemente para implementar o padrão RAG.

**Decisão**: Usar Pinecone em vez de alternativas auto-hospedadas (como FAISS) ou outras soluções managed (como Weaviate ou Milvus).

**Razão**:
- Serviço gerenciado (sem necessidade de gerenciar infraestrutura).
- Alta performance em ambientes de borda (Edge).
- SDK otimizado e bem documentado para integração com Next.js.
- Suporte nativo para filtragem por metadados e namespaces.

**Trade-offs**: Custo recorrente comparado a soluções self-hosted, mas compensado pela economia de tempo de desenvolvimento e manutenção.

---

## ADR-002: Runtime Mix (Node.js & Edge)

**Contexto**: Algumas bibliotecas de processamento de arquivos (como `pdf-parse`) exigem APIs nativas do Node.js (ex: `fs`), enquanto outras operações se beneficiam da baixa latência das Edge Functions.

**Decisão**: Usar o runtime padrão (Node.js) para rotas que processam arquivos (ex: `/api/ingest`) e considerar o runtime Edge para rotas de crawling e chat quando possível.

**Razão**:
- Suporte total a bibliotecas de processamento de arquivos que dependem de APIs Node.js (ex: `Buffer`, `fs`).
- Flexibilidade para usar o ambiente de execução mais adequado para cada tarefa.

**Trade-offs**: Latência ligeiramente maior para as rotas Node.js em comparação com as Edge Functions globais.

---

## ADR-003: Estratégia de Chunking

**Contexto**: O conteúdo indexado precisa ser dividido em segmentos (chunks) que caibam no contexto do modelo e preservem o significado semântico.

**Decisão**: Suportar múltiplos métodos de divisão de texto, incluindo:
- `RecursiveCharacterTextSplitter`: Ideal para documentos longos e contínuos.
- `MarkdownTextSplitter`: Preserva a estrutura semântica baseada em cabeçalhos Markdown.

**Razão**:
- Diferentes fontes de dados (sites vs documentos estruturados) exigem abordagens diferentes para manter a relevância semântica.
- O uso de `chunkOverlap` garante que o contexto não seja perdido nas transições entre pedaços.

---

## ADR-004: Vercel AI SDK para Streaming

**Contexto**: Experiência do usuário (UX) em chats requer feedback imediato.

**Decisão**: Utilizar o Vercel AI SDK para gerenciar o streaming de respostas.

**Razão**:
- Abstração simples para lidar com streams de texto da OpenAI e outros provedores.
- Hooks de frontend integrados (`useChat`) que simplificam o estado do chat.
- Padronização do formato de resposta (SSE).
