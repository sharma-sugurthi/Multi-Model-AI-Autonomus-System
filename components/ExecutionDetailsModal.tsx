import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ExecutionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  executionId: string;
}

interface ExecutionDetails {
  id: string;
  workflow_id: string;
  status: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  created_at: string;
  completed_at?: string;
  error?: string;
}

interface ExecutionLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  nodeId?: string;
}

export function ExecutionDetailsModal({
  isOpen,
  onClose,
  executionId,
}: ExecutionDetailsModalProps) {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [executionDetails, setExecutionDetails] = useState<ExecutionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !executionId) return;

    // Fetch execution details
    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/langflow/runs/${executionId}`);
        if (!response.ok) throw new Error('Failed to fetch execution details');
        const data = await response.json();
        setExecutionDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch execution details');
      }
    };

    // Set up SSE for real-time logs
    const eventSource = new EventSource(`/api/langflow/runs/${executionId}/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data);
        setLogs(prev => [...prev, log]);
      } catch (err) {
        console.error('Error parsing log:', err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    fetchDetails();

    return () => {
      eventSource.close();
    };
  }, [isOpen, executionId]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (error || !executionDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-4">
            <div className="text-lg text-red-500">{error || 'Execution not found'}</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Execution Details</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {executionDetails && (
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge className={getStatusColor(executionDetails.status)}>
                {executionDetails.status}
              </Badge>
            </div>
            <div className="mt-2">
              <span className="font-medium">Duration:</span>{' '}
              {executionDetails.duration}ms
            </div>
          </div>
        )}

        <Tabs defaultValue="logs">
          <TabsList>
            <TabsTrigger value="logs">Message Logs</TabsTrigger>
            <TabsTrigger value="details">Execution Details</TabsTrigger>
          </TabsList>

          <TabsContent value="logs">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded ${
                    log.level === 'error'
                      ? 'bg-red-50 text-red-700'
                      : log.level === 'warning'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    {log.nodeId && (
                      <Badge variant="outline">{log.nodeId}</Badge>
                    )}
                  </div>
                  <p className="mt-1">{log.message}</p>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No logs available
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="details">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <pre className="text-sm">
                {JSON.stringify(executionDetails, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 