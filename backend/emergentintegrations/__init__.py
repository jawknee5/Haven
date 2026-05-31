"""Stub for emergentintegrations LLM module."""
import json
from typing import Optional


class UserMessage:
    """Represents a user message."""
    def __init__(self, text: str):
        self.text = text


class LlmChat:
    """Stub LLM chat interface."""
    def __init__(self, api_key: str, session_id: str, system_message: str):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.model = None

    def with_model(self, provider: str, model_name: str):
        """Set the model."""
        self.model = (provider, model_name)
        return self

    async def send_message(self, message: UserMessage) -> str:
        """Send a message and get a response."""
        # Return a fallback response when emergentintegrations is not available
        return (
            "I'm here to help. Tell me what you need. "
            "(Note: Advanced AI features are currently unavailable.)"
        )
