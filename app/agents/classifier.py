from typing import Dict, Any, Tuple
from app.models.schemas import InputFormat, BusinessIntent

class ClassifierAgent:
    def __init__(self):
        self.email_keywords = ['subject:', 'from:', 'to:', 'date:', 'dear', 'regards']
        self.json_keywords = ['{', '}', '"', ':', '[', ']']
        self.pdf_keywords = ['pdf', 'document', 'page', 'section']
        
        self.invoice_keywords = ['invoice', 'payment', 'amount', 'total', 'due date']
        self.rfq_keywords = ['quote', 'quotation', 'request', 'price', 'specification']
        self.complaint_keywords = ['complaint', 'issue', 'problem', 'error', 'wrong']
        self.regulation_keywords = ['regulation', 'compliance', 'policy', 'law', 'standard']

    async def classify(self, content: str) -> Tuple[InputFormat, BusinessIntent, float]:
        """Classify input content into format and business intent."""
        # Determine format
        format_score = self._determine_format(content)
        format_type = max(format_score.items(), key=lambda x: x[1])[0]
        
        # Determine intent
        intent_score = self._determine_intent(content)
        intent_type = max(intent_score.items(), key=lambda x: x[1])[0]
        
        # Calculate confidence (average of format and intent confidence)
        confidence = (format_score[format_type] + intent_score[intent_type]) / 2
        
        return format_type, intent_type, confidence

    def _determine_format(self, content: str) -> Dict[InputFormat, float]:
        """Determine the format of the content using keyword matching."""
        content_lower = content.lower()
        
        # Count keyword matches for each format
        email_score = sum(1 for kw in self.email_keywords if kw in content_lower)
        json_score = sum(1 for kw in self.json_keywords if kw in content_lower)
        pdf_score = sum(1 for kw in self.pdf_keywords if kw in content_lower)
        
        # Calculate normalized scores
        total_score = email_score + json_score + pdf_score
        if total_score == 0:
            return {InputFormat.EMAIL: 0.33, InputFormat.JSON: 0.33, InputFormat.PDF: 0.33}
            
        return {
            InputFormat.EMAIL: email_score / total_score,
            InputFormat.JSON: json_score / total_score,
            InputFormat.PDF: pdf_score / total_score
        }

    def _determine_intent(self, content: str) -> Dict[BusinessIntent, float]:
        """Determine the business intent using keyword matching."""
        content_lower = content.lower()
        
        # Count keyword matches for each intent
        invoice_score = sum(1 for kw in self.invoice_keywords if kw in content_lower)
        rfq_score = sum(1 for kw in self.rfq_keywords if kw in content_lower)
        complaint_score = sum(1 for kw in self.complaint_keywords if kw in content_lower)
        regulation_score = sum(1 for kw in self.regulation_keywords if kw in content_lower)
        
        # Calculate normalized scores
        total_score = invoice_score + rfq_score + complaint_score + regulation_score
        if total_score == 0:
            return {
                BusinessIntent.INVOICE: 0.25,
                BusinessIntent.RFQ: 0.25,
                BusinessIntent.COMPLAINT: 0.25,
                BusinessIntent.REGULATION: 0.25
            }
            
        return {
            BusinessIntent.INVOICE: invoice_score / total_score,
            BusinessIntent.RFQ: rfq_score / total_score,
            BusinessIntent.COMPLAINT: complaint_score / total_score,
            BusinessIntent.REGULATION: regulation_score / total_score
        } 