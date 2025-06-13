import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExecutionDetailsModal } from './ExecutionDetailsModal';
import { toast } from 'sonner';

interface Execution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startTime: string;
  endTime?: string;
  input: any;
  output?: any;
}

interface WorkflowHistoryProps {
  workflowId: string;
}

export function WorkflowHistory({ workflowId }: WorkflowHistoryProps) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchExecutions();
  }, [workflowId]);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/langflow/executions?workflowId=${workflowId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch executions');
      }
      const data = await response.json();
      setExecutions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to fetch executions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (execution: Execution) => {
    setSelectedExecution(execution);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Execution History</h2>
        <Button onClick={fetchExecutions}>Refresh</Button>
      </div>

      <div className="space-y-4">
        {executions.map((execution) => (
          <Card key={execution.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Execution {execution.id}</CardTitle>
                  <CardDescription>
                    Started: {new Date(execution.startTime).toLocaleString()}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    execution.status === 'completed'
                      ? 'default'
                      : execution.status === 'failed'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {execution.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {execution.endTime && (
                  <div className="text-sm text-gray-500">
                    Completed: {new Date(execution.endTime).toLocaleString()}
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetails(execution)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {executions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No executions found
          </div>
        )}
      </div>

      {selectedExecution && (
        <ExecutionDetailsModal
          execution={selectedExecution}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedExecution(null);
          }}
        />
      )}
    </div>
  );
} 