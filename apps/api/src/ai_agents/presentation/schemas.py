from pydantic import BaseModel, Field


class AgentChatRequest(BaseModel):
    session_id: str
    message: str = Field(..., min_length=1, max_length=15000)
    model: str = "qwen2.5:7b"


class AgentChatResponse(BaseModel):
    response: str
    coins_earned: int = 0
    input_blocked: bool = False
    output_blocked: bool = False
    guardrail_reason: str = ""
    tool_calls: list[dict] = []


class AdminDecision(BaseModel):
    decision: str = Field(..., pattern="^(approved|rejected)$")


class CheckpointResponse(BaseModel):
    checkpoint_id: str | None = None
    node: str | None = None
    messages_count: int = 0
    tool_calls_count: int = 0


class ReplayRequest(BaseModel):
    checkpoint_id: str
    new_message: str
