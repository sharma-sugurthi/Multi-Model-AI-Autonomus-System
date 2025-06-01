import pytest
from app.agents.classifier import ClassifierAgent
from app.agents.email_agent import EmailAgent
from app.agents.json_agent import JsonAgent
from app.agents.pdf_agent import PdfAgent
from app.models.schemas import InputFormat, BusinessIntent, Tone, Urgency

# Test data
SAMPLE_EMAIL = """
From: test@example.com
Subject: Urgent Issue with Service
Date: 2024-01-01

Dear Support Team,

I am writing to express my dissatisfaction with your service. The system has been down for 3 days now, and this is causing significant business impact.

Please address this immediately.

Best regards,
Test User
"""

SAMPLE_JSON = """
{
    "invoice_number": "INV-2024-001",
    "amount": 15000.00,
    "currency": "USD",
    "items": [
        {
            "description": "Product A",
            "quantity": 1500,
            "price": 10.00
        }
    ]
}
"""

SAMPLE_PDF_CONTENT = """
INVOICE
Invoice Number: INV-2024-002
Date: 2024-01-01

This document contains GDPR compliance requirements and data protection measures.
Total Amount: $5,000.00

Thank you for your business.
"""

@pytest.fixture
def classifier_agent():
    return ClassifierAgent("test-api-key")

@pytest.fixture
def email_agent():
    return EmailAgent("test-api-key")

@pytest.fixture
def json_agent():
    return JsonAgent()

@pytest.fixture
def pdf_agent():
    return PdfAgent("test-api-key")

@pytest.mark.asyncio
async def test_classifier_agent(classifier_agent):
    # Test email classification
    format_enum, intent_enum, metadata = await classifier_agent.classify(SAMPLE_EMAIL)
    assert format_enum == InputFormat.EMAIL
    assert intent_enum == BusinessIntent.COMPLAINT

    # Test JSON classification
    format_enum, intent_enum, metadata = await classifier_agent.classify(SAMPLE_JSON)
    assert format_enum == InputFormat.JSON
    assert intent_enum == BusinessIntent.INVOICE

@pytest.mark.asyncio
async def test_email_agent(email_agent):
    # Test email processing
    response = await email_agent.process(SAMPLE_EMAIL)
    assert response.success
    assert response.data["tone"] == Tone.ESCALATION
    assert response.data["urgency"] == Urgency.HIGH
    assert response.next_action == "escalate_issue"

def test_json_agent(json_agent):
    # Test JSON processing
    response = json_agent.process(SAMPLE_JSON)
    assert response.success
    assert "High-value invoice detected" in response.data["anomalies"]
    assert response.next_action == "flag_compliance"

def test_pdf_agent(pdf_agent):
    # Test PDF processing
    response = pdf_agent.process(SAMPLE_PDF_CONTENT.encode())
    assert response.success
    assert "GDPR compliance mentioned" in response.data["compliance_flags"]
    assert response.next_action == "flag_compliance"

@pytest.mark.asyncio
async def test_end_to_end_flow():
    # This test would require mocking the LLM and other external services
    # It's included as a placeholder for future implementation
    pass 