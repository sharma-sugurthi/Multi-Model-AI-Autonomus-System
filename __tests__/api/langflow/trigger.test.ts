import { POST } from '@/app/api/langflow/trigger/route';

describe('POST /api/langflow/trigger', () => {
  const mockWorkflowId = '123';
  const mockInputs = { key: 'value' };
  const mockResponse = { execution_id: '456', status: 'running' };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should successfully trigger a workflow', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const request = new Request('http://localhost:3000/api/langflow/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: mockWorkflowId, inputs: mockInputs }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:7860/api/v1/run/123',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: mockInputs }),
      }
    );
    expect(data).toEqual(mockResponse);
    expect(response.status).toBe(200);
  });

  it('should handle missing workflowId', async () => {
    const request = new Request('http://localhost:3000/api/langflow/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: mockInputs }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data).toEqual({ error: 'Missing required field: workflowId' });
    expect(response.status).toBe(400);
  });

  it('should handle missing inputs', async () => {
    const request = new Request('http://localhost:3000/api/langflow/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: mockWorkflowId }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data).toEqual({ error: 'Missing required field: inputs' });
    expect(response.status).toBe(400);
  });

  it('should handle invalid workflowId format', async () => {
    const request = new Request('http://localhost:3000/api/langflow/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: '', inputs: mockInputs }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data).toEqual({ error: 'Invalid workflow ID format' });
    expect(response.status).toBe(400);
  });

  it('should handle workflow not found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Workflow not found' }),
    });

    const request = new Request('http://localhost:3000/api/langflow/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: mockWorkflowId, inputs: mockInputs }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data).toEqual({ error: 'Workflow not found' });
    expect(response.status).toBe(404);
  });

  it('should handle invalid request to LangFlow API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid request' }),
    });

    const request = new Request('http://localhost:3000/api/langflow/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: mockWorkflowId, inputs: mockInputs }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data).toEqual({ error: 'Invalid request to LangFlow API' });
    expect(response.status).toBe(400);
  });

  it('should handle internal server error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const request = new Request('http://localhost:3000/api/langflow/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: mockWorkflowId, inputs: mockInputs }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data).toEqual({ error: 'Internal server error' });
    expect(response.status).toBe(500);
  });
}); 