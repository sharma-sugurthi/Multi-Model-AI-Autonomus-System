const LANGFLOW_API_URL = 'http://localhost:7860';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workflowId, inputs } = body;

    // 1. Check for missing workflowId
    if (workflowId === undefined || workflowId === null) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: workflowId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check for empty workflowId or not a string
    if (typeof workflowId !== 'string' || workflowId.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Invalid workflow ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check for missing inputs
    if (!inputs) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: inputs' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(`${LANGFLOW_API_URL}/api/v1/run/${workflowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs }),
    });

    // Handle different response status codes appropriately
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      // Map LangFlow API errors to appropriate status codes
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ error: 'Workflow not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 400) {
        return new Response(
          JSON.stringify({ error: 'Invalid request to LangFlow API' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: errorData.error || 'Failed to trigger workflow' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error triggering workflow:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 