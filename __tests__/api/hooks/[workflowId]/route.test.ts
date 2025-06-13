import { GET, POST } from '@/app/api/hooks/[workflowId]/route';
import { NextRequest } from 'next/server';

describe('Webhook API', () => {
  const mockWorkflowId = 'test-workflow-id';
  const mockInputPayload = { test: 'data' };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should handle GET request', async () => {
    const request = new NextRequest(`http://localhost:3000/api/hooks/${mockWorkflowId}`);
    const response = await GET(request, { params: { workflowId: mockWorkflowId } });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('webhookUrl');
    expect(data.webhookUrl).toContain(mockWorkflowId);
  });

  it('should handle POST request with valid payload', async () => {
    const mockResponse = new Response(JSON.stringify({ executionId: 'test-execution-id' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const request = new NextRequest(`http://localhost:3000/api/hooks/${mockWorkflowId}`, {
      method: 'POST',
      body: JSON.stringify(mockInputPayload),
    });

    const response = await POST(request, { params: { workflowId: mockWorkflowId } });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('executionId');
  });

  it('should handle POST request with invalid JSON', async () => {
    const request = new NextRequest(`http://localhost:3000/api/hooks/${mockWorkflowId}`, {
      method: 'POST',
      body: 'invalid-json',
    });

    const response = await POST(request, { params: { workflowId: mockWorkflowId } });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid JSON payload');
  });

  it('should handle missing workflow ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/hooks/');
    const response = await GET(request, { params: { workflowId: '' } });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Workflow ID is required');
  });

  it('should handle fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const request = new NextRequest(`http://localhost:3000/api/hooks/${mockWorkflowId}`, {
      method: 'POST',
      body: JSON.stringify(mockInputPayload),
    });

    const response = await POST(request, { params: { workflowId: mockWorkflowId } });
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to trigger workflow');
  });

  it('should handle non-OK response', async () => {
    const mockResponse = new Response('Not Found', { status: 404 });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const request = new NextRequest(`http://localhost:3000/api/hooks/${mockWorkflowId}`, {
      method: 'POST',
      body: JSON.stringify(mockInputPayload),
    });

    const response = await POST(request, { params: { workflowId: mockWorkflowId } });
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to trigger workflow');
  });
}); 