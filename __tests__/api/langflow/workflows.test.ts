import { GET } from '@/app/api/langflow/workflows/route';

describe('GET /api/langflow/workflows', () => {
  const mockWorkflows = [
    { id: '1', name: 'Workflow 1' },
    { id: '2', name: 'Workflow 2' },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return workflows when the API call is successful', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWorkflows),
    });

    const response = await GET(new Request('http://localhost:3000/api/langflow/workflows'));
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:7860/api/v1/workflows',
      { headers: { 'Content-Type': 'application/json' } }
    );
    expect(data).toEqual(mockWorkflows);
  });

  it('should return an error when the API call fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    const response = await GET(new Request('http://localhost:3000/api/langflow/workflows'));
    const data = await response.json();

    expect(data).toEqual({
      error: 'Failed to fetch workflows',
    });
    expect(response.status).toBe(500);
  });
}); 