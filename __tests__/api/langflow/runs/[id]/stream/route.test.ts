import { GET } from '@/app/api/langflow/runs/[id]/stream/route';
import { NextRequest } from 'next/server';

describe('Streaming Execution Logs API', () => {
  const mockExecutionId = 'test-execution-id';
  const mockLogs = [
    { timestamp: '2024-03-20T10:00:00Z', message: 'Starting execution' },
    { timestamp: '2024-03-20T10:00:01Z', message: 'Processing data' },
    { timestamp: '2024-03-20T10:00:02Z', message: 'Execution completed' },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should stream execution logs', async () => {
    const mockResponse = new Response(JSON.stringify(mockLogs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const request = new NextRequest(`http://localhost:3000/api/langflow/runs/${mockExecutionId}/stream`);
    const response = await GET(request, { params: { id: mockExecutionId } });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');

    const reader = response.body?.getReader();
    const chunks: string[] = [];
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader!.read();
      done = readerDone;
      if (value) {
        chunks.push(new TextDecoder().decode(value));
      }
    }

    const streamedContent = chunks.join('');
    mockLogs.forEach(log => {
      expect(streamedContent).toContain(`data: ${JSON.stringify(log)}\n\n`);
    });
  });

  it('should handle fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const request = new NextRequest(`http://localhost:3000/api/langflow/runs/${mockExecutionId}/stream`);
    const response = await GET(request, { params: { id: mockExecutionId } });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch execution logs');
  });

  it('should handle non-OK response', async () => {
    const mockResponse = new Response('Not Found', { status: 404 });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const request = new NextRequest(`http://localhost:3000/api/langflow/runs/${mockExecutionId}/stream`);
    const response = await GET(request, { params: { id: mockExecutionId } });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch execution logs');
  });
}); 