from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class InputFormat(str, Enum):
    EMAIL = "email"
    JSON = "json"
    PDF = "pdf"

class BusinessIntent(str, Enum):
    INVOICE = "invoice"
    RFQ = "rfq"
    COMPLAINT = "complaint"
    REGULATION = "regulation"
    FRAUD_RISK = "fraud_risk"

class Tone(str, Enum):
    POLITE = "polite"
    ESCALATION = "escalation"
    THREATENING = "threatening"
    NEUTRAL = "neutral"
    FORMAL = "formal"
    INFORMAL = "informal"
    COMPLAINT = "complaint"

class Urgency(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class BaseInput(BaseModel):
    source: str
    timestamp: datetime = Field(default_factory=datetime.now)
    format: InputFormat
    intent: BusinessIntent
    metadata: Dict[str, Any] = Field(default_factory=dict)

class EmailInput(BaseInput):
    sender: EmailStr
    subject: str
    body: str
    tone: Tone
    urgency: Urgency
    attachments: List[str] = Field(default_factory=list)

class JsonInput(BaseInput):
    data: Dict[str, Any]
    schema_version: str
    validation_status: bool = True
    anomalies: List[str] = Field(default_factory=list)

class PdfInput(BaseInput):
    content: str
    page_count: int
    extracted_fields: Dict[str, Any] = Field(default_factory=dict)
    compliance_flags: List[str] = Field(default_factory=list)

class AgentResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    next_action: Optional[str] = None

class MemoryEntry(BaseModel):
    id: str
    input_data: BaseInput
    agent_responses: List[AgentResponse]
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    status: str = "pending"
    action_taken: Optional[str] = None 