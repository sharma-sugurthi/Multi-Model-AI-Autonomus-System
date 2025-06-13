import { GET } from '@/app/api/langflow/executions/route';

describe('GET /api/langflow/executions', () => {
  const mockExecutions = [
    { id: '1', workflow_id: '1', status: 'completed' },
    { id: '2', workflow_id: '1', status: 'running' },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return all executions when no workflowId is provided', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockExecutions),
    });

    const request = new Request('http://localhost:3000/api/langflow/executions');
    const response = await GET(request);
    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:7860/api/v1/executions',
      { headers: { 'Content-Type': 'application/json' } }
    );
    expect(data).toEqual(mockExecutions);
    expect(response.status).toBe(200);
  });

  it('should return filtered executions when workflowId is provided', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockExecutions),
    });

    const request = new Request(
      'http://localhost:3000/api/langflow/executions?workflowId=1'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:7860/api/v1/executions?workflow_id=1',
      { headers: { 'Content-Type': 'application/json' } }
    );
    expect(data).toEqual(mockExecutions);
    expect(response.status).toBe(200);
  });

  it('should return an error when the API call fails', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    const request = new Request('http://localhost:3000/api/langflow/executions');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual({
      error: 'Failed to fetch executions',
    });
    expect(response.status).toBe(500);
  });
}); 