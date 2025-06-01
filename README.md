# Multi-Format Autonomous AI System with Contextual Decisioning & Chained Actions

## Project Overview
This system processes Email, JSON, and PDF inputs, classifies them, routes them to specialized agents, and dynamically chains follow-up actions based on extracted data. It is designed for extensibility, maintainability, and easy deployment.

## Key Features
- Multi-format input support (Email, JSON, PDF)
- Intelligent classification (now rule-based, no LLM required)
- Specialized agents for each format
- Shared memory store (Redis)
- Action routing and chaining
- Modern web UI for testing
- Docker support for easy deployment
- Test coverage and documentation

## Important Note: No OpenAI API Key Required
**This version does NOT require an OpenAI API key.**
- All classification and analysis logic is now rule-based (keyword matching and heuristics).
- The system is fully functional without any external LLM or paid API.
- This change was made due to the unavailability of an OpenAI API key for this deployment.

## Architecture
- **Classifier Agent:** Rule-based input format and intent detection
- **Email Agent:** Rule-based tone and urgency analysis
- **JSON Agent:** Schema validation and anomaly detection
- **PDF Agent:** Text extraction and compliance keyword search
- **Shared Memory Store:** Redis
- **Action Router:** Simple routing logic

## Getting Started

### Prerequisites
- Python 3.9+
- Docker (for Redis)

### Setup
```bash
# Clone the repository
# cd into the project directory

# Install dependencies
pip install -r requirements.txt

# Start Redis (using Docker)
sudo docker run -d -p 6379:6379 --name flowbit-redis redis:6-alpine

# Start the application
uvicorn app.main:app --reload
```

### Access
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Web UI: http://localhost:8000/static/index.html

## Testing
```bash
pytest
```

## Project Structure
- `app/` - Main application code
- `app/agents/` - Specialized agents
- `app/core/` - Core logic (memory, router)
- `app/models/` - Data models and schemas
- `app/static/` - Web UI
- `samples/` - Sample input files
- `tests/` - Test files

## Submission Note
- The system was originally designed to use OpenAI LLMs for classification and analysis.
- Due to the lack of an API key, all LLM-based logic has been replaced with robust rule-based logic.
- The system remains fully functional and demonstrates the intended architecture and flow.

## License
MIT

## Contribution
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 