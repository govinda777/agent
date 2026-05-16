import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/db/agents';
import { createAgentExecutor } from '@/lib/agents/executor';
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function POST(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;
    const body = await req.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const agentConfig = await getAgent(agentId);

    if (!agentConfig) {
      return NextResponse.json({ error: `Agent with id ${agentId} not found` }, { status: 404 });
    }

    const executor = await createAgentExecutor(agentConfig);

    // Format messages for Langchain
    // We separate the last message (input) from the history
    const lastMessage = messages[messages.length - 1];
    const historyMessages = messages.slice(0, -1);

    const chatHistory = historyMessages.map((msg: any) => {
      if (msg.role === 'user') return new HumanMessage(msg.content);
      if (msg.role === 'assistant') return new AIMessage(msg.content);
      if (msg.role === 'system') return new SystemMessage(msg.content);
      return new HumanMessage(msg.content);
    });

    // Instead of streaming via streamText, we will use LangChain's streamEvents
    // to stream the output. Since Vercel AI SDK expects a specific format,
    // we'll stream plain text back for now, compatible with standard fetch/eventsource
    // or we can use Langchain's Vercel AI SDK adapter if preferred.

    // For simplicity, we just invoke it and return the text if stream isn't strictly requested,
    // but typically we stream. To stream with Langchain & Nextjs:

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start execution in background
    (async () => {
      try {
        const events = await executor.streamEvents({
          input: lastMessage.content,
          chat_history: chatHistory,
        }, { version: "v2" });

        for await (const event of events) {
          if (event.event === "on_chat_model_stream") {
            const chunk = event.data.chunk;
            if (chunk && chunk.content) {
               await writer.write(encoder.encode(chunk.content));
            }
          }
        }
      } catch (error) {
        console.error("Error executing agent:", error);
        await writer.write(encoder.encode("\n\n[Error executing agent]"));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
