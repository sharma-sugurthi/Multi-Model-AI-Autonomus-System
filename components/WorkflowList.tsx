import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TriggerWorkflowModal } from './TriggerWorkflowModal';
import { ExecutionDetailsModal } from './ExecutionDetailsModal';
import { toast } from 'sonner';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  lastRun?: string;
  nextRun?: string;
}

interface Execution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startTime: string;
  endTime?: string;
  input: any;
  output?: any;
}

export function WorkflowList() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/langflow/workflows');
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }
      const data = await response.json();
      setWorkflows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsTriggerModalOpen(true);
  };

  const handleViewDetails = async (workflow: Workflow) => {
    try {
      const response = await fetch(`/api/langflow/executions?workflowId=${workflow.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch execution details');
      }
      const executions = await response.json();
      if (executions.length > 0) {
        setSelectedExecution(executions[0]);
        setIsDetailsModalOpen(true);
      } else {
        toast.info('No executions found for this workflow');
      }
    } catch (err) {
      toast.error('Failed to fetch execution details');
    }
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
        <h2 className="text-2xl font-bold">Workflows</h2>
        <Button onClick={fetchWorkflows}>Refresh</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{workflow.name}</CardTitle>
                  <CardDescription>{workflow.description}</CardDescription>
                </div>
                <Badge
                  variant={workflow.status === 'active' ? 'default' : 'secondary'}
                >
                  {workflow.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.lastRun && (
                  <div className="text-sm text-gray-500">
                    Last Run: {new Date(workflow.lastRun).toLocaleString()}
                  </div>
                )}
                {workflow.nextRun && (
                  <div className="text-sm text-gray-500">
                    Next Run: {new Date(workflow.nextRun).toLocaleString()}
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetails(workflow)}
                  >
                    View Details
                  </Button>
                  <Button onClick={() => handleTrigger(workflow)}>
                    Trigger
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedWorkflow && (
        <TriggerWorkflowModal
          workflowId={selectedWorkflow.id}
          workflowName={selectedWorkflow.name}
          isOpen={isTriggerModalOpen}
          onClose={() => {
            setIsTriggerModalOpen(false);
            setSelectedWorkflow(null);
          }}
        />
      )}

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