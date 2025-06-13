jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (data, init) => {
        const response = new (global.Response || require('node-fetch').Response)(JSON.stringify(data), {
          status: init?.status || 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        response.json = () => Promise.resolve(data);
        return response;
      },
    },
  };
});

import { GET } from '@/app/api/langflow/executions/route';

describe('Executions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all executions successfully', async () => {
    const mockExecutions = [
      {
        id: 'execution-1',
        workflow_id: 'workflow-1',
        status: 'completed',
        created_at: '2024-03-20T12:00:00Z',
      },
      {
        id: 'execution-2',
        workflow_id: 'workflow-1',
        status: 'running',
        created_at: '2024-03-20T13:00:00Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockExecutions),
    });

    const request = new Request('http://localhost:3000/api/langflow/executions');
    const response = await GET(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual(mockExecutions);
  });

  it('should fetch executions for a specific workflow', async () => {
    const mockExecutions = [
      {
        id: 'execution-1',
        workflow_id: 'workflow-1',
        status: 'completed',
        created_at: '2024-03-20T12:00:00Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockExecutions),
    });

    const request = new Request('http://localhost:3000/api/langflow/executions?workflowId=workflow-1');
    const response = await GET(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual(mockExecutions);
  });

  it('should handle API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' }),
    });

    const request = new Request('http://localhost:3000/api/langflow/executions');
    const response = await GET(request);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Failed to fetch executions');
  });
}); 