import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { nodeTypes } from './nodes';

interface WorkflowEditorProps {
  workflowId?: string;
  onSave?: (workflow: any) => void;
}

export function WorkflowEditor({ workflowId, onSave }: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
    }
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/langflow/workflows/${workflowId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow');
      }
      const data = await response.json();
      setWorkflowName(data.name);
      setWorkflowDescription(data.description);
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (err) {
      toast.error('Failed to fetch workflow');
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = async () => {
    try {
      setLoading(true);
      const workflow = {
        id: workflowId,
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
      };

      const response = await fetch(
        workflowId
          ? `/api/langflow/workflows/${workflowId}`
          : '/api/langflow/workflows',
        {
          method: workflowId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflow),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save workflow');
      }

      const data = await response.json();
      toast.success('Workflow saved successfully');
      if (onSave) {
        onSave(data);
      }
    } catch (err) {
      toast.error('Failed to save workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = (type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      data: { label: `New ${type} node` },
    };
    setNodes((nds: Node[]) => [...nds, newNode]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="h-[600px] border rounded-lg">
      <div className="p-4 border-b">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Workflow Name</Label>
            <Input
              id="name"
              value={workflowName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={workflowDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setWorkflowDescription(e.target.value)}
              placeholder="Enter workflow description"
            />
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-right">
          <div className="space-x-2">
            <Button onClick={() => handleAddNode('input')}>Add Input</Button>
            <Button onClick={() => handleAddNode('output')}>Add Output</Button>
            <Button onClick={() => handleAddNode('processor')}>Add Processor</Button>
            <Button onClick={() => handleAddNode('classifier')}>Add Classifier</Button>
          </div>
        </Panel>
        <Panel position="bottom-right">
          <Button onClick={handleSave} disabled={loading}>
            Save Workflow
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
} 