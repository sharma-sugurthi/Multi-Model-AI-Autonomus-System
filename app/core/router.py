from typing import Dict, Any, Optional
import httpx
from ..models.schemas import AgentResponse, MemoryEntry

class ActionRouter:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(base_url=base_url)
        self.action_handlers = {
            "create_ticket": self._handle_create_ticket,
            "escalate_issue": self._handle_escalate_issue,
            "flag_compliance": self._handle_flag_compliance,
            "log_alert": self._handle_log_alert,
            "generate_summary": self._handle_generate_summary
        }

    async def route_action(self, entry: MemoryEntry) -> AgentResponse:
        """Route and execute the appropriate action based on agent responses."""
        if not entry.agent_responses:
            return AgentResponse(
                success=False,
                message="No agent responses to route",
                error="No actions available"
            )

        # Get the latest agent response
        latest_response = entry.agent_responses[-1]
        
        if not latest_response.next_action:
            return AgentResponse(
                success=False,
                message="No next action specified",
                error="Missing action specification"
            )

        # Get the appropriate handler
        handler = self.action_handlers.get(latest_response.next_action)
        if not handler:
            return AgentResponse(
                success=False,
                message=f"Unknown action: {latest_response.next_action}",
                error="Invalid action"
            )

        try:
            # Execute the action
            result = await handler(entry)
            return AgentResponse(
                success=True,
                message=f"Successfully executed {latest_response.next_action}",
                data=result
            )
        except Exception as e:
            return AgentResponse(
                success=False,
                message=f"Failed to execute {latest_response.next_action}",
                error=str(e)
            )

    async def _handle_create_ticket(self, entry: MemoryEntry) -> Dict[str, Any]:
        """Handle ticket creation action."""
        response = await self.client.post(
            "/api/tickets",
            json={
                "title": f"New {entry.input_data.intent} from {entry.input_data.source}",
                "description": str(entry.input_data),
                "priority": "high" if entry.input_data.format == "email" else "medium"
            }
        )
        response.raise_for_status()
        return response.json()

    async def _handle_escalate_issue(self, entry: MemoryEntry) -> Dict[str, Any]:
        """Handle issue escalation action."""
        response = await self.client.post(
            "/api/escalations",
            json={
                "issue_id": entry.id,
                "reason": "High priority or compliance risk detected",
                "source": entry.input_data.source
            }
        )
        response.raise_for_status()
        return response.json()

    async def _handle_flag_compliance(self, entry: MemoryEntry) -> Dict[str, Any]:
        """Handle compliance flagging action."""
        response = await self.client.post(
            "/api/compliance/flags",
            json={
                "document_id": entry.id,
                "flags": entry.input_data.compliance_flags if hasattr(entry.input_data, "compliance_flags") else [],
                "source": entry.input_data.source
            }
        )
        response.raise_for_status()
        return response.json()

    async def _handle_log_alert(self, entry: MemoryEntry) -> Dict[str, Any]:
        """Handle alert logging action."""
        response = await self.client.post(
            "/api/alerts",
            json={
                "alert_id": entry.id,
                "message": f"Alert from {entry.input_data.source}",
                "severity": "high",
                "details": str(entry.input_data)
            }
        )
        response.raise_for_status()
        return response.json()

    async def _handle_generate_summary(self, entry: MemoryEntry) -> Dict[str, Any]:
        """Handle summary generation action."""
        response = await self.client.post(
            "/api/summaries",
            json={
                "document_id": entry.id,
                "content": str(entry.input_data),
                "format": entry.input_data.format
            }
        )
        response.raise_for_status()
        return response.json()

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose() 