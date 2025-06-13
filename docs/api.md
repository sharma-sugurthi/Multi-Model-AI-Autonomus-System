# API Documentation

## Workflows

### List Workflows
```http
GET /api/langflow/workflows
```

Returns a list of all workflows.

**Response**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "status": "active" | "inactive",
    "lastRun": "string",
    "nextRun": "string",
    "nodes": [],
    "edges": []
  }
]
```

### Get Workflow
```http
GET /api/langflow/workflows/:id
```

Returns a specific workflow by ID.

**Response**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "status": "active" | "inactive",
  "lastRun": "string",
  "nextRun": "string",
  "nodes": [],
  "edges": []
}
```

### Create Workflow
```http
POST /api/langflow/workflows
```

Creates a new workflow.

**Request Body**
```json
{
  "name": "string",
  "description": "string",
  "nodes": [],
  "edges": []
}
```

**Response**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "status": "active",
  "nodes": [],
  "edges": []
}
```

### Update Workflow
```http
PUT /api/langflow/workflows/:id
```

Updates an existing workflow.

**Request Body**
```json
{
  "name": "string",
  "description": "string",
  "nodes": [],
  "edges": []
}
```

**Response**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "status": "active" | "inactive",
  "nodes": [],
  "edges": []
}
```

### Delete Workflow
```http
DELETE /api/langflow/workflows/:id
```

Deletes a workflow.

**Response**
```json
{
  "success": true
}
```

## Executions

### List Executions
```http
GET /api/langflow/executions?workflowId=:workflowId
```

Returns a list of executions for a specific workflow.

**Response**
```json
[
  {
    "id": "string",
    "workflowId": "string",
    "status": "running" | "completed" | "failed" | "pending",
    "startTime": "string",
    "endTime": "string",
    "input": {},
    "output": {}
  }
]
```

### Get Execution
```http
GET /api/langflow/executions/:id
```

Returns a specific execution by ID.

**Response**
```json
{
  "id": "string",
  "workflowId": "string",
  "status": "running" | "completed" | "failed" | "pending",
  "startTime": "string",
  "endTime": "string",
  "input": {},
  "output": {}
}
```

### Trigger Workflow
```http
POST /api/trigger
```

Triggers a workflow execution.

**Request Body**
```json
{
  "workflowId": "string",
  "engine": "langflow",
  "triggerType": "manual" | "webhook" | "cron",
  "inputPayload": {},
  "schedule": "string" // Required for cron trigger type
}
```

**Response**
```json
{
  "executionId": "string"
}
```

## Webhooks

### Get Webhook URL
```http
GET /api/hooks/:workflowId
```

Returns the webhook URL for a specific workflow.

**Response**
```json
{
  "webhookUrl": "string"
}
```

### Trigger Webhook
```http
POST /api/hooks/:workflowId
```

Triggers a workflow via webhook.

**Request Body**
```json
{
  // Any JSON payload
}
```

**Response**
```json
{
  "executionId": "string"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "string"
}
```

### 404 Not Found
```json
{
  "error": "string"
}
```

### 500 Internal Server Error
```json
{
  "error": "string"
}
``` 