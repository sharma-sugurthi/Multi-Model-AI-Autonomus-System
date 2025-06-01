from typing import Dict, Any
from app.models.schemas import Tone, Urgency, AgentResponse

class EmailAgent:
    def __init__(self):
        self.tone_keywords = {
            Tone.POLITE: ['dear', 'sincerely', 'regards', 'respectfully', 'please', 'thank you'],
            Tone.ESCALATION: ['urgent', 'immediately', 'asap', 'critical'],
            Tone.THREATENING: ['legal', 'sue', 'action', 'court', 'lawyer'],
            Tone.NEUTRAL: ['hi', 'hello', 'hey', 'thanks', 'cheers'],
            Tone.FORMAL: ['dear', 'sincerely', 'regards', 'respectfully'],
            Tone.INFORMAL: ['hi', 'hello', 'hey', 'thanks', 'cheers'],
            Tone.COMPLAINT: ['unhappy', 'dissatisfied', 'poor', 'bad', 'wrong']
        }
        
        self.urgency_keywords = {
            Urgency.HIGH: ['urgent', 'immediately', 'asap', 'critical', 'emergency'],
            Urgency.MEDIUM: ['soon', 'shortly', 'prompt', 'timely'],
            Urgency.LOW: ['when convenient', 'at your leisure', 'no rush'],
            Urgency.CRITICAL: ['critical', 'emergency', 'immediate', 'urgent']
        }

    async def process(self, content: str) -> AgentResponse:
        """Process email content and extract structured information."""
        try:
            # Extract basic email fields
            fields = self._extract_fields(content)
            
            # Analyze tone
            tone = self._analyze_tone(content)
            
            # Analyze urgency
            urgency = self._analyze_urgency(content)
            
            return AgentResponse(
                success=True,
                message="Email processed successfully",
                data={
                    "fields": fields,
                    "tone": tone.value,
                    "urgency": urgency.value
                },
                next_action="route_to_action"
            )
            
        except Exception as e:
            return AgentResponse(
                success=False,
                message="Failed to process email",
                error=str(e)
            )

    def _extract_fields(self, content: str) -> Dict[str, str]:
        """Extract basic email fields using simple parsing."""
        fields = {}
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if line.startswith('Subject:'):
                fields['subject'] = line[8:].strip()
            elif line.startswith('From:'):
                fields['from'] = line[5:].strip()
            elif line.startswith('To:'):
                fields['to'] = line[3:].strip()
            elif line.startswith('Date:'):
                fields['date'] = line[5:].strip()
                
        # Extract body
        body_start = 0
        for i, line in enumerate(lines):
            if line.strip() == '':
                body_start = i + 1
                break
        fields['body'] = '\n'.join(lines[body_start:]).strip()
        
        return fields

    def _analyze_tone(self, content: str) -> Tone:
        """Analyze email tone using keyword matching."""
        content_lower = content.lower()
        tone_scores = {tone: 0 for tone in Tone}
        
        for tone, keywords in self.tone_keywords.items():
            tone_scores[tone] = sum(1 for kw in keywords if kw in content_lower)
            
        return max(tone_scores.items(), key=lambda x: x[1])[0]

    def _analyze_urgency(self, content: str) -> Urgency:
        """Analyze email urgency using keyword matching."""
        content_lower = content.lower()
        urgency_scores = {urgency: 0 for urgency in Urgency}
        
        for urgency, keywords in self.urgency_keywords.items():
            urgency_scores[urgency] = sum(1 for kw in keywords if kw in content_lower)
            
        return max(urgency_scores.items(), key=lambda x: x[1])[0] 