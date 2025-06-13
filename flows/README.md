# LangFlow Agent System

This directory contains the LangFlow implementation of our Multi-Format AI System agents.

## Setup

1. Install Docker and Docker Compose if not already installed
2. Run the following command to start LangFlow:
   ```bash
   docker-compose up -d
   ```
3. Access LangFlow at http://localhost:7860

## Agent Flows

The following agent flows are implemented:

1. **Classifier Agent**
   - Input: Raw text content
   - Output: Format type (EMAIL, JSON, PDF) and business intent

2. **Email Agent**
   - Input: Email content
   - Output: Extracted information and next actions

3. **JSON Agent**
   - Input: JSON data
   - Output: Processed data and business logic

4. **PDF Agent**
   - Input: PDF content
   - Output: Extracted information and structured data

## Integration

The LangFlow agents are integrated with the Next.js frontend through API endpoints. Each flow exposes a REST API endpoint that can be called from the frontend.

## Development

1. Create new flows in the `flows/agents` directory
2. Export flows as JSON files
3. Import flows in LangFlow UI
4. Test flows using the built-in testing interface
5. Deploy flows to production using the export/import functionality 