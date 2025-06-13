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

import { GET } from '@/app/api/langflow/workflows/route';

describe('Workflows API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch workflows successfully', async () => {
    const mockWorkflows = [
      {
        id: 'workflow-1',
        name: 'Test Workflow 1',
        description: 'A test workflow',
        created_at: '2024-03-20T12:00:00Z',
      },
      {
        id: 'workflow-2',
        name: 'Test Workflow 2',
        description: 'Another test workflow',
        created_at: '2024-03-20T13:00:00Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWorkflows),
    });

    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual(mockWorkflows);
  });

  it('should handle LangFlow API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Failed to fetch workflows');
  });
}); 