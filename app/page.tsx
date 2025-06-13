"use client";

import { useState } from 'react';
import { useWorkflows } from './api/hooks/useWorkflows';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TriggerWorkflowModal } from '@/components/TriggerWorkflowModal';
import { ExecutionDetailsModal } from '@/components/ExecutionDetailsModal';

export default function Home() {
  const { workflows, executions, loading, error, triggerWorkflow } = useWorkflows();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">LangFlow Workflows</h1>
      
      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows">
          <ScrollArea className="h-[600px] rounded-md border p-4">
            <div className="grid gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <CardTitle>{workflow.name}</CardTitle>
                    <CardDescription>
                      Created: {new Date(workflow.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => setSelectedWorkflow(workflow.id)}
                      >
                        Trigger
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="executions">
          <ScrollArea className="h-[600px] rounded-md border p-4">
            <div className="grid gap-4">
              {executions.map((execution) => (
                <Card key={execution.id}>
                  <CardHeader>
                    <CardTitle>
                      Execution {execution.id.slice(0, 8)}...
                    </CardTitle>
                    <CardDescription>
                      Status: {execution.status}
                      <br />
                      Created: {new Date(execution.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => setSelectedExecution(execution.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {selectedWorkflow && (
        <TriggerWorkflowModal
          workflowId={selectedWorkflow}
          onClose={() => setSelectedWorkflow(null)}
          onTrigger={triggerWorkflow}
        />
      )}

      {selectedExecution && (
        <ExecutionDetailsModal
          executionId={selectedExecution}
          onClose={() => setSelectedExecution(null)}
        />
      )}
    </main>
  );
} 