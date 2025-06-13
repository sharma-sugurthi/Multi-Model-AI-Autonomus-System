import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TriggerWorkflowModal } from '@/components/TriggerWorkflowModal';
import '@testing-library/jest-dom';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TriggerWorkflowModal', () => {
  const mockWorkflowId = 'test-workflow';
  const mockWorkflowName = 'Test Workflow';
  const mockInputPayload = { test: 'data' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders trigger modal with three tabs', () => {
    render(
      <TriggerWorkflowModal
        workflowId={mockWorkflowId}
        workflowName={mockWorkflowName}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Trigger Workflow')).toBeInTheDocument();
    expect(screen.getByText('Manual')).toBeInTheDocument();
    expect(screen.getByText('Webhook')).toBeInTheDocument();
    expect(screen.getByText('Cron')).toBeInTheDocument();
  });

  it('triggers workflow manually', async () => {
    const mockResponse = new Response(JSON.stringify({ executionId: 'test-execution' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(
      <TriggerWorkflowModal
        workflowId={mockWorkflowId}
        workflowName={mockWorkflowName}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Enter input payload
    const inputField = screen.getByLabelText(/input payload/i);
    fireEvent.change(inputField, {
      target: { value: JSON.stringify(mockInputPayload) },
    });

    // Click trigger button
    fireEvent.click(screen.getByText('Trigger'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: mockWorkflowId,
          engine: 'langflow',
          triggerType: 'manual',
          inputPayload: mockInputPayload,
        }),
      });
    });
  });

  it('displays webhook URL', () => {
    render(
      <TriggerWorkflowModal
        workflowId={mockWorkflowId}
        workflowName={mockWorkflowName}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Switch to webhook tab
    fireEvent.click(screen.getByText('Webhook'));

    const webhookUrl = screen.getByText(/webhook url/i);
    expect(webhookUrl).toBeInTheDocument();
    expect(webhookUrl).toHaveTextContent(`/api/hooks/${mockWorkflowId}`);
  });

  it('schedules cron job', async () => {
    const mockResponse = new Response(JSON.stringify({ executionId: 'test-execution' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(
      <TriggerWorkflowModal
        workflowId={mockWorkflowId}
        workflowName={mockWorkflowName}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Switch to cron tab
    fireEvent.click(screen.getByText('Cron'));

    // Enter cron schedule
    const scheduleField = screen.getByLabelText(/cron schedule/i);
    fireEvent.change(scheduleField, {
      target: { value: '*/5 * * * *' },
    });

    // Enter input payload
    const inputField = screen.getByLabelText(/input payload/i);
    fireEvent.change(inputField, {
      target: { value: JSON.stringify(mockInputPayload) },
    });

    // Click schedule button
    fireEvent.click(screen.getByText('Schedule'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: mockWorkflowId,
          engine: 'langflow',
          triggerType: 'cron',
          inputPayload: mockInputPayload,
          schedule: '*/5 * * * *',
        }),
      });
    });
  });

  it('handles invalid JSON input', async () => {
    render(
      <TriggerWorkflowModal
        workflowId={mockWorkflowId}
        workflowName={mockWorkflowName}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Enter invalid JSON
    const inputField = screen.getByLabelText(/input payload/i);
    fireEvent.change(inputField, {
      target: { value: 'invalid-json' },
    });

    // Click trigger button
    fireEvent.click(screen.getByText('Trigger'));

    await waitFor(() => {
      expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
    });
  });

  it('handles fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <TriggerWorkflowModal
        workflowId={mockWorkflowId}
        workflowName={mockWorkflowName}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Enter input payload
    const inputField = screen.getByLabelText(/input payload/i);
    fireEvent.change(inputField, {
      target: { value: JSON.stringify(mockInputPayload) },
    });

    // Click trigger button
    fireEvent.click(screen.getByText('Trigger'));

    await waitFor(() => {
      expect(screen.getByText('Failed to trigger workflow')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <TriggerWorkflowModal
        workflowId={mockWorkflowId}
        workflowName={mockWorkflowName}
        isOpen={true}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(
      <TriggerWorkflowModal
        workflowId={mockWorkflowId}
        workflowName={mockWorkflowName}
        isOpen={false}
        onClose={() => {}}
      />
    );

    expect(screen.queryByText('Trigger Workflow')).not.toBeInTheDocument();
  });
}); 