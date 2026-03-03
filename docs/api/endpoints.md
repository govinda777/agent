# Documentação de APIs

Este documento descreve os endpoints principais do sistema de chatbot.

## POST /api/chat

**Descrição**: Endpoint principal do chatbot que fornece respostas com streaming usando RAG.

**Request**:
```json
{
  "messages": [
    {"role": "user", "content": "Sua pergunta aqui"}
  ]
}
```

**Response**: Server-Sent Events (stream) de texto gerado pelo LLM.
**Headers**: `Content-Type: text/plain; charset=utf-8` (DataStreamResponse do AI SDK)

---

## POST /api/crawl

**Descrição**: Crawlea uma URL e indexa o conteúdo no Pinecone.

**Request**:
```json
{
  "url": "https://example.com",
  "options": {
    "splittingMethod": "recursive",
    "chunkSize": 1000,
    "chunkOverlap": 200
  }
}
```

**Response**:
```json
{
  "success": true,
  "documents": [
    {
      "pageContent": "...",
      "metadata": {
        "url": "https://example.com",
        "text": "...",
        "hash": "..."
      }
    }
  ]
}
```

---

## POST /api/ingest

**Descrição**: Endpoint para upload e indexação de arquivos (PDF, TXT, MD).

**Request**: `multipart/form-data`
- `file`: O arquivo a ser carregado (max 4MB).
- `namespace` (opcional): O namespace do Pinecone para indexação.

**Response**:
```json
{
  "success": true,
  "message": "File processed successfully",
  "fileName": "documento.pdf",
  "chunks": 15,
  "namespace": "default"
}
```

---

## POST /api/context

**Descrição**: Retorna os chunks de contexto usados para a última resposta gerada.

**Request**:
```json
{
  "messages": [...],
  "namespace": "default"
}
```

**Response**:
```json
{
  "context": [
    {
      "id": "...",
      "score": 0.85,
      "values": [],
      "metadata": {
        "chunk": "...",
        "text": "...",
        "url": "..."
      }
    }
  ]
}
```

---

## POST /api/clearIndex

**Descrição**: Limpa (deleta) todos os vetores dentro de um namespace específico no Pinecone.

**Request**: (Sem corpo ou campos opcionais de namespace via env)

**Response**:
```json
{
  "success": true
}
```
