from dataclasses import dataclass, field


@dataclass
class Agent:
    id: str
    name: str
    system_prompt: str
    model: str = "qwen2.5:7b"
    tools: list[str] = field(default_factory=list)
    max_iterations: int = 10
    temperature: float = 0.7
