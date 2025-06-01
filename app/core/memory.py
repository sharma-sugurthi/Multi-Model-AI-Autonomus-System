import json
from typing import Optional, List, Dict, Any
import redis
from datetime import datetime
from ..models.schemas import MemoryEntry, BaseInput, AgentResponse

class MemoryStore:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)
        self.prefix = "flowbit:"

    def _get_key(self, key: str) -> str:
        return f"{self.prefix}{key}"

    def store_entry(self, entry: MemoryEntry) -> str:
        """Store a new memory entry and return its ID."""
        key = self._get_key(f"entry:{entry.id}")
        data = entry.model_dump()
        data["created_at"] = data["created_at"].isoformat()
        data["updated_at"] = data["updated_at"].isoformat()
        data["input_data"] = data["input_data"].model_dump()
        
        self.redis.set(key, json.dumps(data))
        return entry.id

    def get_entry(self, entry_id: str) -> Optional[MemoryEntry]:
        """Retrieve a memory entry by ID."""
        key = self._get_key(f"entry:{entry_id}")
        data = self.redis.get(key)
        
        if not data:
            return None
            
        data = json.loads(data)
        # Convert string dates back to datetime
        data["created_at"] = datetime.fromisoformat(data["created_at"])
        data["updated_at"] = datetime.fromisoformat(data["updated_at"])
        
        return MemoryEntry(**data)

    def update_entry(self, entry_id: str, updates: Dict[str, Any]) -> bool:
        """Update an existing memory entry."""
        entry = self.get_entry(entry_id)
        if not entry:
            return False

        for key, value in updates.items():
            setattr(entry, key, value)
        
        entry.updated_at = datetime.now()
        self.store_entry(entry)
        return True

    def add_agent_response(self, entry_id: str, response: AgentResponse) -> bool:
        """Add an agent response to an existing entry."""
        entry = self.get_entry(entry_id)
        if not entry:
            return False

        entry.agent_responses.append(response)
        entry.updated_at = datetime.now()
        self.store_entry(entry)
        return True

    def list_entries(self, limit: int = 100) -> List[MemoryEntry]:
        """List recent memory entries."""
        keys = self.redis.keys(self._get_key("entry:*"))
        entries = []
        
        for key in keys[:limit]:
            data = json.loads(self.redis.get(key))
            data["created_at"] = datetime.fromisoformat(data["created_at"])
            data["updated_at"] = datetime.fromisoformat(data["updated_at"])
            entries.append(MemoryEntry(**data))
            
        return sorted(entries, key=lambda x: x.created_at, reverse=True)

    def search_entries(self, query: Dict[str, Any]) -> List[MemoryEntry]:
        """Search memory entries based on criteria."""
        entries = self.list_entries()
        results = []
        
        for entry in entries:
            matches = True
            for key, value in query.items():
                if not hasattr(entry, key) or getattr(entry, key) != value:
                    matches = False
                    break
            if matches:
                results.append(entry)
                
        return results

    def delete_entry(self, entry_id: str) -> bool:
        """Delete a memory entry."""
        key = self._get_key(f"entry:{entry_id}")
        return bool(self.redis.delete(key)) 