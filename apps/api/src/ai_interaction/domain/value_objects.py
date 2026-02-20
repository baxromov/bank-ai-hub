from enum import Enum


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TOOL = "tool"


class AgentMode(str, Enum):
    SIMPLE_CHAT = "simple_chat"
    REACT_AGENT = "react_agent"
