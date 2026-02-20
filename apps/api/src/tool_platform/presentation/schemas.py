from datetime import datetime
from pydantic import BaseModel, Field


class SubmitToolRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, pattern="^[a-z0-9-]+$")
    display_name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10)
    category: str
    department: str | None = None
    prompt_template: str = Field(..., min_length=10)
    input_schema: dict = Field(default_factory=dict)


class ToolResponse(BaseModel):
    id: str
    name: str
    display_name: str
    description: str
    category: str
    department: str | None = None
    version: str
    status: str
    coin_price: int | None = None
    usage_count: int = 0
    average_rating: float = 0.0
    author_id: str


class ExecuteToolRequest(BaseModel):
    params: dict = Field(default_factory=dict)


class ApproveToolRequest(BaseModel):
    coin_reward: int = Field(0, ge=0)
