import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Tool, DynamicTool } from "@langchain/core/tools";
import { AgentConfig } from "../db/agents";

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export async function createAgentExecutor(agentConfig: AgentConfig) {
  const llm = new ChatOpenAI({
    modelName: agentConfig.modelName,
    temperature: 0,
  });

  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
  });

  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: agentConfig.pineconeNamespace,
  });

  const retriever = vectorStore.asRetriever();

  // Define tools based on agent config
  const tools: Tool[] = [];

  if (agentConfig.tools.includes('rag_search')) {
    tools.push(
      new DynamicTool({
        name: "rag_search",
        description: "Search the knowledge base for information to answer user questions. Input should be a search query.",
        func: async (query: string) => {
          try {
            const docs = await retriever.invoke(query);
            return docs.map(doc => doc.pageContent).join("\n\n");
          } catch (error) {
            console.error("Error searching knowledge base:", error);
            return "Sorry, there was an error searching the knowledge base.";
          }
        },
      })
    );
  }

  // Create prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", agentConfig.systemPrompt],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  // Create the agent
  const agent = createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  // Create the executor
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true, // Useful for debugging, can be disabled in production
  });

  return agentExecutor;
}
