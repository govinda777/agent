# Guia de Troubleshooting (Resolução de Problemas)

Este documento detalha soluções para problemas comuns encontrados no sistema de chatbot com RAG.

## Problemas Técnicos Comuns

### 1. Erro: "Index does not exist"
- **Sintoma**: As rotas de chat ou ingest falham ao tentar acessar o Pinecone.
- **Causa**: O índice especificado em `PINECONE_INDEX` no `.env` ainda não foi criado.
- **Solução**: Crie o índice manualmente no [Console do Pinecone](https://app.pinecone.io) com a dimensão 1536 (exigida pelos modelos de embedding da OpenAI).

---

### 2. Respostas Genéricas ou "I don't know the answer"
- **Sintoma**: O chatbot responde de forma genérica ou diz não saber a resposta, mesmo quando o conteúdo foi indexado.
- **Causa**:
  - Score de similaridade abaixo do mínimo configurado (geralmente 0.7).
  - O conteúdo indexado não é semanticamente relevante para a pergunta.
  - Namespace incorreto sendo consultado.
- **Solução**:
  - Verifique os scores de similaridade no endpoint `/api/context`.
  - Tente reduzir levemente o `minScore` no arquivo `src/app/utils/context.ts` (ex: para 0.65).
  - Verifique se o conteúdo foi realmente indexado no namespace correto.

---

### 3. Erro no Upload de Arquivos (PDF/TXT)
- **Sintoma**: "No text content found in file" ou erros de processamento.
- **Causa**:
  - O PDF pode ser uma imagem (sem camada de texto OCR).
  - Arquivo corrompido ou acima do limite de 4MB.
  - Caractere não suportado na codificação de texto.
- **Solução**:
  - Tente abrir o arquivo e copiar o texto manualmente para testar se ele é selecionável.
  - Divida arquivos grandes em partes menores.

---

### 4. Lentidão no Streaming de Resposta
- **Sintoma**: A resposta demora muito para começar ou é interrompida no meio.
- **Causa**:
  - Alta latência na rede ou nos serviços da OpenAI/Pinecone.
  - Grande volume de contexto sendo enviado no prompt (excedendo 3000 tokens).
  - Cold starts de Edge Functions.
- **Solução**:
  - Reduza o número de matches (Top-K) recuperados ou o `maxTokens` no contexto.
  - Verifique se a região do seu índice Pinecone é geograficamente próxima à sua implantação.

---

### 5. Erros no Playwright (Testes E2E)
- **Sintoma**: `npm run test:e2e` falha com timeout ou erros de rede.
- **Causa**: Servidor local não está rodando ou as chaves de API no `.env` estão incorretas/ausentes.
- **Solução**: Certifique-se de que o comando `npm run dev` está rodando em um terminal separado antes de iniciar os testes. Verifique se o arquivo `.env` está configurado corretamente.
