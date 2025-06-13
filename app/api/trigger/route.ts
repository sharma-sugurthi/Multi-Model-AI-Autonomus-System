import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workflowId, engine, triggerType, inputPayload } = body;

    if (engine !== 'langflow') {
      return NextResponse.json(
        { error: 'Only langflow engine is supported' },
        { status: 400 }
      );
    }

    const response = await fetch('http://localhost:7860/api/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flow_id: workflowId,
        input_value: inputPayload,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to trigger workflow' },
      { status: 500 }
    );
  }
} 