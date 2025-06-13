import { useState, useEffect } from 'react';
import { useToast, type ToasterToast } from '@/components/ui/use-toast';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface Execution {
  id: string;
  workflow_id: string;
  status: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/langflow/workflows');
      if (!response.ok) throw new Error('Failed to fetch workflows');
      const data = await response.json();
      setWorkflows(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows');
      toast({
        title: 'Error',
        description: 'Failed to fetch workflows',
      } as ToasterToast);
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutions = async (workflowId?: string) => {
    try {
      setLoading(true);
      const url = workflowId
        ? `/api/langflow/executions?workflowId=${workflowId}`
        : '/api/langflow/executions';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch executions');
      const data = await response.json();
      setExecutions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch executions');
      toast({
        title: 'Error',
        description: 'Failed to fetch executions',
      } as ToasterToast);
    } finally {
      setLoading(false);
    }
  };

  const triggerWorkflow = async (workflowId: string, inputs: Record<string, any>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/langflow/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workflowId, inputs }),
      });

      if (!response.ok) throw new Error('Failed to trigger workflow');
      
      const data = await response.json();
      toast({
        title: 'Success',
        description: 'Workflow triggered successfully',
      } as ToasterToast);
      
      // Refresh executions after triggering
      await fetchExecutions(workflowId);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger workflow');
      toast({
        title: 'Error',
        description: 'Failed to trigger workflow',
      } as ToasterToast);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    fetchExecutions();
  }, []);

  return {
    workflows,
    executions,
    loading,
    error,
    fetchWorkflows,
    fetchExecutions,
    triggerWorkflow,
  };
} 