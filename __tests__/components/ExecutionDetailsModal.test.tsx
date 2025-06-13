import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExecutionDetailsModal } from '@/components/ExecutionDetailsModal';
import '@testing-library/jest-dom';

// Mock fetch for SSE
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock EventSource
class MockEventSource {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  close = jest.fn();

  constructor(url: string) {
    // Simulate connection
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', {
          data: JSON.stringify({ message: 'Test log message' })
        }));
      }
    }, 100);
  }
}

global.EventSource = MockEventSource as any;

describe('ExecutionDetailsModal', () => {
  const mockExecution = {
    id: 'test-execution',
    workflowId: 'test-workflow',
    status: 'completed',
    startTime: '2024-03-20T10:00:00Z',
    endTime: '2024-03-20T10:01:00Z',
    input: { test: 'data' },
    output: { result: 'success' },
  };

  const mockLogs = [
    { timestamp: '2024-03-20T10:00:00Z', message: 'Starting execution' },
    { timestamp: '2024-03-20T10:00:30Z', message: 'Processing data' },
    { timestamp: '2024-03-20T10:01:00Z', message: 'Execution completed' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch for execution details
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: mockExecution.id,
        workflow_id: mockExecution.workflowId,
        status: mockExecution.status,
        start_time: mockExecution.startTime,
        end_time: mockExecution.endTime,
        input: mockExecution.input,
        output: mockExecution.output,
        error: null,
      }),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders execution details correctly', async () => {
    render(
      <ExecutionDetailsModal
        execution={mockExecution}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Wait for execution details to load
    await waitFor(() => {
      expect(screen.getByText('Execution Details')).toBeInTheDocument();
    });

    // Check if execution ID is rendered
    expect(screen.getByText(`ID: ${mockExecution.id}`)).toBeInTheDocument();

    // Check if workflow ID is rendered
    expect(screen.getByText(`Workflow ID: ${mockExecution.workflowId}`)).toBeInTheDocument();

    // Check if status badge is rendered with correct color
    const statusBadge = screen.getByText(mockExecution.status);
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');

    // Check if start time is rendered
    expect(screen.getByText('Start Time:')).toBeInTheDocument();
    expect(screen.getByText('March 20, 2024, 10:00:00 AM')).toBeInTheDocument();
  });

  it('displays execution logs in real-time', async () => {
    const mockResponse = new Response(JSON.stringify(mockLogs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(
      <ExecutionDetailsModal
        execution={mockExecution}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Switch to logs tab
    fireEvent.click(screen.getByText('Logs'));

    await waitFor(() => {
      mockLogs.forEach(log => {
        expect(screen.getByText(log.message)).toBeInTheDocument();
      });
    });
  });

  it('handles fetch errors for logs', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <ExecutionDetailsModal
        execution={mockExecution}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Switch to logs tab
    fireEvent.click(screen.getByText('Logs'));

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch logs')).toBeInTheDocument();
    });
  });

  it('displays input and output data', () => {
    render(
      <ExecutionDetailsModal
        execution={mockExecution}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Switch to input tab
    fireEvent.click(screen.getByText('Input'));
    expect(screen.getByText(JSON.stringify(mockExecution.input, null, 2))).toBeInTheDocument();

    // Switch to output tab
    fireEvent.click(screen.getByText('Output'));
    expect(screen.getByText(JSON.stringify(mockExecution.output, null, 2))).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <ExecutionDetailsModal
        execution={mockExecution}
        isOpen={true}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ExecutionDetailsModal
        execution={mockExecution}
        isOpen={false}
        onClose={() => {}}
      />
    );

    expect(screen.queryByText('Execution Details')).not.toBeInTheDocument();
  });

  it('streams logs in real-time', async () => {
    render(
      <ExecutionDetailsModal
        execution={mockExecution}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Wait for log message to appear
    await waitFor(() => {
      expect(screen.getByText('Test log message')).toBeInTheDocument();
    });
  });

  it('handles EventSource errors', async () => {
    // Mock EventSource error
    const mockErrorEvent = new Event('error');
    const originalEventSource = global.EventSource;
    
    class ErrorEventSource extends MockEventSource {
      constructor(url: string) {
        super(url);
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(mockErrorEvent);
          }
        }, 100);
      }
    }

    global.EventSource = ErrorEventSource as any;

    render(
      <ExecutionDetailsModal
        execution={mockExecution}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Error connecting to log stream')).toBeInTheDocument();
    });

    // Restore original EventSource
    global.EventSource = originalEventSource;
  });

  it('displays correct status badge colors for different statuses', async () => {
    const statuses = [
      { status: 'running', color: 'bg-yellow-100 text-yellow-800' },
      { status: 'completed', color: 'bg-green-100 text-green-800' },
      { status: 'failed', color: 'bg-red-100 text-red-800' },
      { status: 'pending', color: 'bg-gray-100 text-gray-800' },
    ];

    for (const { status, color } of statuses) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: mockExecution.id,
          workflow_id: mockExecution.workflowId,
          status,
          start_time: mockExecution.startTime,
          end_time: null,
          input: mockExecution.input,
          output: null,
          error: null,
        }),
      });

      const { unmount } = render(
        <ExecutionDetailsModal
          execution={mockExecution}
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Wait for status badge to appear
      await waitFor(() => {
        const statusBadge = screen.getByText(status);
        expect(statusBadge).toHaveClass(...color.split(' '));
      });

      unmount();
    }
  });
}); 