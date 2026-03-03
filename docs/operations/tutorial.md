# Tutorial: Construindo seu Chatbot com RAG

Este guia passo a passo foi retirado do README original e serve como uma introdução prática à construção deste sistema.

## 1. Configurando sua Aplicação Next.js

Next.js é um framework poderoso que permite construir aplicações web modernas usando React. Para criar uma nova aplicação Next.js, rode o seguinte comando:

### npx
```bash
npx create-next-app chatbot
```

Instale o pacote `ai` do Vercel AI SDK:
```bash
npm install ai
```

## 2. Criando o Chatbot

Nesta etapa, usaremos o Vercel SDK para estabelecer o backend e o frontend do chatbot.

### Componente Frontend do Chatbot

O componente `Chat` gerencia a interface do usuário:

```tsx
import React, { FormEvent, ChangeEvent } from "react";
import Messages from "./Messages";
import { Message } from "ai/react";

interface Chat {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleMessageSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  messages: Message[];
}

const Chat: React.FC<Chat> = ({ input, handleInputChange, handleMessageSubmit, messages }) => {
  return (
    <div id="chat" className="...">
      <Messages messages={messages} />
      <form onSubmit={handleMessageSubmit} className="...">
        <input type="text" className="..." value={input} onChange={handleInputChange} />
        <span className="...">Press ⮐ to send</span>
      </form>
    </div>
  );
};

export default Chat;
```

### Endpoint da API de Chat

O endpoint `api/chat/route.ts` lida com as requisições para a OpenAI:

```ts
import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const prompt = [{ role: "system", content: "..." }];
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [...prompt, ...messages.filter((m: Message) => m.role === "user")],
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (e) { throw e; }
}
```

## 3. Adicionando Contexto (RAG)

A adição de contexto através da Recuperação Aumentada de Geração (RAG) é o que torna este chatbot especial, evitando alucinações.

### Semeando a Base de Conhecimento (Seeding)

Usamos um crawler para buscar dados de URLs externas, gerar embeddings e armazená-los no Pinecone:

```ts
async function seed(url: string, limit: number, indexName: string, options: SeedOptions) {
  const crawler = new Crawler(1, limit || 100);
  const pages = await crawler.crawl(url);
  const splitter = splittingMethod === 'recursive' ?
    new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap }) : new MarkdownTextSplitter({});
  const documents = await Promise.all(pages.map(page => prepareDocument(page, splitter)));
  // ... Gerar embeddings e upsert no Pinecone
}
```

### Buscando Coincidências (Retrieval)

Para encontrar as informações mais relevantes para a pergunta do usuário:

```ts
const getMatchesFromEmbeddings = async (embeddings: number[], topK: number, namespace: string) => {
  const pinecone = new Pinecone();
  const index = pinecone.Index(process.env.PINECONE_INDEX!);
  const queryResult = await index.namespace(namespace).query({
    vector: embeddings,
    topK,
    includeMetadata: true,
  });
  return queryResult.matches || [];
}
```

### Atualizando o Prompt com Contexto

Injetamos o contexto recuperado diretamente no prompt do sistema:

```ts
const context = await getContext(lastMessage.content, "");
const prompt = [{
  role: "system",
  content: `AI assistant... START CONTEXT BLOCK ${context} END OF CONTEXT BLOCK...`,
}];
```

Para mais detalhes sobre a implementação atual, consulte os arquivos no diretório `src/app`.
