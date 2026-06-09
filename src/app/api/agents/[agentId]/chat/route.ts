import { NextResponse } from 'next/server';
import { getDecryptedAgentById } from '@/lib/db/agents';

// Chat routes must use nodejs runtime
export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json();

    const agent = getDecryptedAgentById(agentId);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (!agent.n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'n8n Webhook URL is not configured for this agent' },
        { status: 400 }
      );
    }

    // Proxy the request to n8n
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Bearer token if provided by the user in the form
    if (agent.n8nAuthToken) {
      headers['Authorization'] = `Bearer ${agent.n8nAuthToken}`;
    }

    const n8nResponse = await fetch(agent.n8nWebhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...body,
        _agentId: agent.id, // Inject context
        _channel: body.channel || 'unknown'
      }),
    });

    if (!n8nResponse.ok) {
      console.error(`n8n responded with status ${n8nResponse.status}`);
      return NextResponse.json(
        { error: 'Error communicating with n8n workflow' },
        { status: 502 }
      );
    }

    const n8nData = await n8nResponse.json();

    return NextResponse.json(n8nData, { status: 200 });
  } catch (error) {
    console.error('Error proxying chat to n8n:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
