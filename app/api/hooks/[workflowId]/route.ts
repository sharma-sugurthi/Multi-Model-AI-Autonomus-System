import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const response = await fetch('http://localhost:3000/api/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflowId: params.workflowId,
        engine: 'langflow',
        triggerType: 'webhook',
        inputPayload: Object.fromEntries(request.nextUrl.searchParams),
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to trigger workflow' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://localhost:3000/api/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflowId: params.workflowId,
        engine: 'langflow',
        triggerType: 'webhook',
        inputPayload: body,
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to trigger workflow' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 