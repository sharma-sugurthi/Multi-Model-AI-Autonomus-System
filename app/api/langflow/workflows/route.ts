const LANGFLOW_API_URL = 'http://localhost:7860';

export async function GET(request: Request) {
  try {
    const response = await fetch(`${LANGFLOW_API_URL}/api/v1/workflows`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch workflows' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch workflows' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 