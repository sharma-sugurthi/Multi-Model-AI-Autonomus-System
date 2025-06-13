const LANGFLOW_API_URL = 'http://localhost:7860';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');

    const url = workflowId
      ? `${LANGFLOW_API_URL}/api/v1/executions?workflow_id=${workflowId}`
      : `${LANGFLOW_API_URL}/api/v1/executions`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch executions' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching executions:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch executions' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 