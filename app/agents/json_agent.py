from typing import Dict, Any, List, Optional
import json
from jsonschema import validate, ValidationError
from ..models.schemas import JsonInput, AgentResponse

class JsonAgent:
    def __init__(self):
        # Define common JSON schemas
        self.schemas = {
            "webhook": {
                "type": "object",
                "required": ["event", "timestamp", "data"],
                "properties": {
                    "event": {"type": "string"},
                    "timestamp": {"type": "string", "format": "date-time"},
                    "data": {"type": "object"}
                }
            },
            "invoice": {
                "type": "object",
                "required": ["invoice_number", "amount", "currency", "items"],
                "properties": {
                    "invoice_number": {"type": "string"},
                    "amount": {"type": "number"},
                    "currency": {"type": "string"},
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["description", "quantity", "price"],
                            "properties": {
                                "description": {"type": "string"},
                                "quantity": {"type": "number"},
                                "price": {"type": "number"}
                            }
                        }
                    }
                }
            },
            "rfq": {
                "type": "object",
                "required": ["request_id", "items", "delivery_date"],
                "properties": {
                    "request_id": {"type": "string"},
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["product_id", "quantity"],
                            "properties": {
                                "product_id": {"type": "string"},
                                "quantity": {"type": "number"},
                                "specifications": {"type": "object"}
                            }
                        }
                    },
                    "delivery_date": {"type": "string", "format": "date"}
                }
            }
        }

    def detect_schema(self, data: Dict[str, Any]) -> Optional[str]:
        """Detect which schema the JSON data matches."""
        for schema_name, schema in self.schemas.items():
            try:
                validate(instance=data, schema=schema)
                return schema_name
            except ValidationError:
                continue
        return None

    def validate_data(self, data: Dict[str, Any], schema_name: Optional[str] = None) -> Dict[str, Any]:
        """Validate JSON data against a specific schema or try to detect the schema."""
        validation_result = {
            "is_valid": False,
            "schema": None,
            "anomalies": []
        }

        try:
            # If schema not specified, try to detect it
            if not schema_name:
                schema_name = self.detect_schema(data)
                if not schema_name:
                    validation_result["anomalies"].append("No matching schema found")
                    return validation_result

            # Validate against the schema
            validate(instance=data, schema=self.schemas[schema_name])
            validation_result["is_valid"] = True
            validation_result["schema"] = schema_name

        except ValidationError as e:
            validation_result["anomalies"].append(str(e))
        except Exception as e:
            validation_result["anomalies"].append(f"Unexpected error: {str(e)}")

        return validation_result

    def check_anomalies(self, data: Dict[str, Any], schema_name: str) -> List[str]:
        """Check for specific anomalies in the data based on business rules."""
        anomalies = []

        if schema_name == "invoice":
            # Check for high-value invoices
            if data.get("amount", 0) > 10000:
                anomalies.append("High-value invoice detected (>$10,000)")
            
            # Check for unusual item quantities
            for item in data.get("items", []):
                if item.get("quantity", 0) > 1000:
                    anomalies.append(f"Unusual quantity detected for item: {item.get('description')}")

        elif schema_name == "rfq":
            # Check for urgent delivery requests
            from datetime import datetime, timedelta
            delivery_date = datetime.strptime(data.get("delivery_date", ""), "%Y-%m-%d")
            if delivery_date - datetime.now() < timedelta(days=7):
                anomalies.append("Urgent delivery request detected (<7 days)")

        return anomalies

    def determine_action(self, validation_result: Dict[str, Any], anomalies: List[str]) -> str:
        """Determine the next action based on validation results and anomalies."""
        if not validation_result["is_valid"]:
            return "log_alert"
        elif anomalies:
            return "flag_compliance"
        else:
            return "create_ticket"

    def process(self, content: str) -> AgentResponse:
        """Process the JSON content and return an agent response."""
        try:
            # Parse JSON content
            data = json.loads(content)
            
            # Validate data and detect schema
            validation_result = self.validate_data(data)
            
            if not validation_result["is_valid"]:
                return AgentResponse(
                    success=False,
                    message="Invalid JSON data",
                    data={"validation_result": validation_result},
                    next_action="log_alert"
                )

            # Check for anomalies
            anomalies = self.check_anomalies(data, validation_result["schema"])
            
            # Create JSON input
            json_input = JsonInput(
                source="webhook",  # Default source, can be overridden
                format="json",
                intent="rfq",  # Default intent, can be overridden by classifier
                data=data,
                schema_version=validation_result["schema"],
                validation_status=validation_result["is_valid"],
                anomalies=anomalies
            )
            
            # Determine next action
            next_action = self.determine_action(validation_result, anomalies)
            
            return AgentResponse(
                success=True,
                message=f"Successfully processed JSON with schema {validation_result['schema']}",
                data=json_input.model_dump(),
                next_action=next_action
            )
        except json.JSONDecodeError as e:
            return AgentResponse(
                success=False,
                message="Invalid JSON format",
                error=str(e),
                next_action="log_alert"
            )
        except Exception as e:
            return AgentResponse(
                success=False,
                message="Failed to process JSON",
                error=str(e),
                next_action="log_alert"
            ) 