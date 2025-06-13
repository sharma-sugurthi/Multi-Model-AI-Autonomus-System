import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExecutionDetailsModal } from './ExecutionDetailsModal';
import { toast } from 'sonner';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  lastRun?: string;
  nextRun?: string;
  nodes: any[];
  edges: any[];
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

interface WorkflowDetailsProps {
  workflowId: string;
}

export function WorkflowDetails({ workflowId }: WorkflowDetailsProps) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkflowDetails();
    fetchExecutions();
  }, [workflowId]);

  const fetchWorkflowDetails = async () => {
    try {
      const response = await fetch(`/api/langflow/workflows/${workflowId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow details');
      }
      const data = await response.json();
      setWorkflow(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to fetch workflow details');
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutions = async () => {
    try {
      const response = await fetch(`/api/langflow/executions?workflowId=${workflowId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch executions');
      }
      const data = await response.json();
      setExecutions(data);
    } catch (err) {
      toast.error('Failed to fetch executions');
    }
  };

  const handleViewExecution = (execution: Execution) => {
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

  if (error || !workflow) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error || 'Workflow not found'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
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
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="executions">
        <TabsList>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
          <TabsTrigger value="edges">Edges</TabsTrigger>
        </TabsList>

        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">Execution {execution.id}</div>
                      <div className="text-sm text-gray-500">
                        Started: {new Date(execution.startTime).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
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
                      <Button
                        variant="outline"
                        onClick={() => handleViewExecution(execution)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                {executions.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No executions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nodes">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Nodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="font-medium">{node.data.label}</div>
                    <div className="text-sm text-gray-500">
                      Type: {node.type}
                    </div>
                    {node.data.description && (
                      <div className="text-sm text-gray-500 mt-2">
                        {node.data.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edges">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Edges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.edges.map((edge) => (
                  <div
                    key={edge.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="font-medium">
                      {edge.source} → {edge.target}
                    </div>
                    {edge.label && (
                      <div className="text-sm text-gray-500 mt-2">
                        {edge.label}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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