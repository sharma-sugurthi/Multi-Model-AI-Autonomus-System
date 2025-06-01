from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import json
import uuid
from typing import Optional
import os
from dotenv import load_dotenv

from .agents.classifier import ClassifierAgent
from .agents.email_agent import EmailAgent
from .agents.json_agent import JsonAgent
from .agents.pdf_agent import PdfAgent
from .core.memory import MemoryStore
from .core.router import ActionRouter
from .models.schemas import InputFormat, BusinessIntent, AgentResponse

# Load environment variables
load_dotenv()

app = FastAPI(title="Multi-Format AI System")

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Initialize components
classifier = ClassifierAgent()
email_agent = EmailAgent()
json_agent = JsonAgent()
pdf_agent = PdfAgent()
memory_store = MemoryStore()
action_router = ActionRouter()

@app.post("/process")
async def process_input(
    content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """Process input from various sources."""
    try:
        # Generate process ID
        process_id = str(uuid.uuid4())
        
        # Get content from file or direct input
        if file:
            content = await file.read()
            content = content.decode()
        elif not content:
            raise HTTPException(status_code=400, detail="No content provided")
            
        # Classify input
        format_type, intent_type, confidence = await classifier.classify(content)
        
        # Process with appropriate agent
        if format_type == InputFormat.EMAIL:
            result = await email_agent.process(content)
        elif format_type == InputFormat.JSON:
            result = await json_agent.process(content)
        else:  # PDF
            result = await pdf_agent.process(content)
            
        # Store result in memory
        memory_store.store(process_id, {
            "format": format_type.value,
            "intent": intent_type.value,
            "confidence": confidence,
            "result": result.dict()
        })
        
        # Route to next action
        next_action = action_router.route(result)
        
        return JSONResponse({
            "process_id": process_id,
            "status": "success",
            "message": "Processing completed",
            "next_action": next_action
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{process_id}")
async def get_status(process_id: str):
    """Get the status of a processing request."""
    try:
        result = memory_store.retrieve(process_id)
        if not result:
            raise HTTPException(status_code=404, detail="Process not found")
            
        return JSONResponse(result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 