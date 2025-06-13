import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Check, Copy } from 'lucide-react';

interface TriggerWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string;
  workflowName: string;
}

export function TriggerWorkflowModal({
  isOpen,
  onClose,
  workflowId,
  workflowName,
}: TriggerWorkflowModalProps) {
  const [activeTab, setActiveTab] = useState('manual');
  const [inputPayload, setInputPayload] = useState('');
  const [cronSchedule, setCronSchedule] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const webhookUrl = `${window.location.origin}/api/hooks/${workflowId}`;

  const handleManualTrigger = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId,
          engine: 'langflow',
          triggerType: 'manual',
          inputPayload: JSON.parse(inputPayload),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger workflow');
      }

      toast({
        title: 'Success',
        description: 'Workflow triggered successfully',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to trigger workflow',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCronSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId,
          engine: 'langflow',
          triggerType: 'cron',
          schedule: cronSchedule,
          inputPayload: inputPayload ? JSON.parse(inputPayload) : {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule workflow');
      }

      toast({
        title: 'Success',
        description: 'Workflow scheduled successfully',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule workflow',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast({
        title: 'Success',
        description: 'Webhook URL copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy webhook URL',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Trigger {workflowName}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-payload">Input Payload (JSON)</Label>
              <Textarea
                id="input-payload"
                value={inputPayload}
                onChange={(e) => setInputPayload(e.target.value)}
                placeholder="Enter JSON payload..."
                className="h-[200px] font-mono"
              />
            </div>
            <Button
              onClick={handleManualTrigger}
              disabled={isLoading || !inputPayload}
              className="w-full"
            >
              {isLoading ? 'Triggering...' : 'Trigger Workflow'}
            </Button>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyWebhookUrl}
                >
                  {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Use this URL to trigger the workflow via HTTP POST request.
                The request body will be passed as the input payload.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cron-schedule">Cron Schedule</Label>
              <Input
                id="cron-schedule"
                value={cronSchedule}
                onChange={(e) => setCronSchedule(e.target.value)}
                placeholder="* * * * *"
                className="font-mono"
              />
              <p className="text-sm text-gray-500">
                Enter a valid cron expression (e.g., "0 * * * *" for hourly)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-payload">Input Payload (JSON, optional)</Label>
              <Textarea
                id="schedule-payload"
                value={inputPayload}
                onChange={(e) => setInputPayload(e.target.value)}
                placeholder="Enter JSON payload..."
                className="h-[100px] font-mono"
              />
            </div>
            <Button
              onClick={handleCronSchedule}
              disabled={isLoading || !cronSchedule}
              className="w-full"
            >
              {isLoading ? 'Scheduling...' : 'Schedule Workflow'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 