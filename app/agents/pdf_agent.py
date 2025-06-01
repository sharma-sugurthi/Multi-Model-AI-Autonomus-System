from typing import Dict, Any, List
from PyPDF2 import PdfReader
from app.models.schemas import AgentResponse

class PdfAgent:
    def __init__(self):
        self.compliance_keywords = [
            'gdpr', 'compliance', 'regulation', 'policy', 'standard',
            'requirement', 'mandatory', 'obligation', 'law', 'statute'
        ]
        
        self.document_type_keywords = {
            'invoice': ['invoice', 'bill', 'payment', 'amount', 'total', 'due date'],
            'contract': ['agreement', 'contract', 'terms', 'conditions', 'parties'],
            'report': ['report', 'analysis', 'findings', 'conclusion', 'summary'],
            'policy': ['policy', 'procedure', 'guideline', 'rule', 'regulation']
        }

    async def process(self, content: str) -> AgentResponse:
        """Process PDF content and extract structured information."""
        try:
            # Extract text from PDF
            text = self._extract_text(content)
            
            # Analyze content
            doc_type = self._analyze_document_type(text)
            compliance_flags = self._check_compliance(text)
            
            return AgentResponse(
                success=True,
                message="PDF processed successfully",
                data={
                    "text": text,
                    "document_type": doc_type,
                    "compliance_flags": compliance_flags
                },
                next_action="route_to_action"
            )
            
        except Exception as e:
            return AgentResponse(
                success=False,
                message="Failed to process PDF",
                error=str(e)
            )

    def _extract_text(self, content: str) -> str:
        """Extract text from PDF content."""
        try:
            # If content is already text, return it
            if not content.startswith('%PDF'):
                return content
                
            # Otherwise, try to parse as PDF
            reader = PdfReader(content)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
            
        except Exception:
            # Fallback to raw content
            return content

    def _analyze_document_type(self, text: str) -> str:
        """Analyze document type using keyword matching."""
        text_lower = text.lower()
        type_scores = {doc_type: 0 for doc_type in self.document_type_keywords}
        
        for doc_type, keywords in self.document_type_keywords.items():
            type_scores[doc_type] = sum(1 for kw in keywords if kw in text_lower)
            
        return max(type_scores.items(), key=lambda x: x[1])[0]

    def _check_compliance(self, text: str) -> List[str]:
        """Check for compliance-related terms."""
        text_lower = text.lower()
        flags = []
        
        for keyword in self.compliance_keywords:
            if keyword in text_lower:
                flags.append(keyword)
                
        return flags 