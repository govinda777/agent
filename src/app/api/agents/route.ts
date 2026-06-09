import { NextResponse } from 'next/server';
import { saveAgent } from '@/lib/db/agents';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'Name and Webhook URL are required' },
        { status: 400 }
      );
    }

    // Save the agent (encryption of token happens in the DB layer)
    const newAgent = saveAgent({
      name: body.name,
      n8nWebhookUrl: body.n8nWebhookUrl,
      n8nAuthToken: body.n8nAuthToken || '',
      channels: body.channels || { web: false, whatsapp: false, instagram: false }
    });

    return NextResponse.json(
      { message: 'Agent created successfully', agent: { id: newAgent.id, name: newAgent.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
