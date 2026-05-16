import { NextRequest, NextResponse } from 'next/server';
import { listAgents, createAgent } from '@/lib/db/agents';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const agents = await listAgents();
    return NextResponse.json({ agents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, systemPrompt, pineconeNamespace, tools, modelName, channels } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newAgent = await createAgent({
      id: uuidv4(),
      name,
      systemPrompt: systemPrompt || "You are a helpful assistant.",
      pineconeNamespace: pineconeNamespace || "default-namespace",
      tools: tools || [],
      modelName: modelName || "gpt-4o",
      channels: channels || ["web"]
    });

    return NextResponse.json(newAgent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
