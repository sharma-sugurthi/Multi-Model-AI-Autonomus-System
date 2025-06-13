import { POST } from '@/app/api/trigger/route';
import { NextRequest } from 'next/server';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Trigger Workflow API', () => {
  const mockWorkflowId = 'test-workflow-id';
  const mockInputPayload = { test: 'data' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should trigger workflow with manual trigger type', async () => {
    const mockResponse = new Response(JSON.stringify({ executionId: 'test-execution-id' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/trigger', {
      method: 'POST',
      body: JSON.stringify({
        workflowId: mockWorkflowId,
        engine: 'langflow',
        triggerType: 'manual',
        inputPayload: mockInputPayload,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('executionId');
  });

  it('should trigger workflow with webhook trigger type', async () => {
    const mockResponse = new Response(JSON.stringify({ executionId: 'test-execution-id' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/trigger', {
      method: 'POST',
      body: JSON.stringify({
        workflowId: mockWorkflowId,
        engine: 'langflow',
        triggerType: 'webhook',
        inputPayload: mockInputPayload,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('executionId');
  });

  it('should trigger workflow with cron trigger type', async () => {
    const mockResponse = new Response(JSON.stringify({ executionId: 'test-execution-id' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/trigger', {
      method: 'POST',
      body: JSON.stringify({
        workflowId: mockWorkflowId,
        engine: 'langflow',
        triggerType: 'cron',
        inputPayload: mockInputPayload,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('executionId');
  });

  it('should handle missing workflow ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/trigger', {
      method: 'POST',
      body: JSON.stringify({
        engine: 'langflow',
        triggerType: 'manual',
        inputPayload: mockInputPayload,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Workflow ID is required');
  });

  it('should handle invalid trigger type', async () => {
    const request = new NextRequest('http://localhost:3000/api/trigger', {
      method: 'POST',
      body: JSON.stringify({
        workflowId: mockWorkflowId,
        engine: 'langflow',
        triggerType: 'invalid',
        inputPayload: mockInputPayload,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid trigger type');
  });

  it('should handle fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const request = new NextRequest('http://localhost:3000/api/trigger', {
      method: 'POST',
      body: JSON.stringify({
        workflowId: mockWorkflowId,
        engine: 'langflow',
        triggerType: 'manual',
        inputPayload: mockInputPayload,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to trigger workflow');
  });
}); 