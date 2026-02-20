import uuid
import time
from collections.abc import AsyncGenerator
from src.ai_interaction.domain.entities import ChatMessage
from src.ai_interaction.domain.repository import AbstractChatRepository
from src.ai_interaction.infrastructure.ollama_client import OllamaClient
from src.ai_interaction.domain.events import PromptSent
from src.event_bus.bus import event_bus


class StreamChatService:
    def __init__(self, repo: AbstractChatRepository, ollama: OllamaClient) -> None:
        self._repo = repo
        self._ollama = ollama

    async def stream_message(
        self, session_id: str, user_id: str, content: str, model: str = "qwen2.5:7b"
    ) -> AsyncGenerator[str, None]:
        # Save user message
        user_msg = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=session_id,
            role="user",
            content=content,
        )
        await self._repo.add_message(user_msg)

        await event_bus.publish(PromptSent(
            user_id=user_id,
            session_id=session_id,
            prompt_length=len(content),
            model=model,
        ))

        # Get conversation history
        messages = await self._repo.get_messages(session_id, limit=20)
        chat_history = [{"role": m.role, "content": m.content} for m in messages]

        # Stream from Ollama
        full_response = ""
        start = time.monotonic()

        async for chunk in self._ollama.stream_chat(model=model, messages=chat_history):
            full_response += chunk
            yield chunk

        latency_ms = int((time.monotonic() - start) * 1000)

        # Save complete assistant message
        assistant_msg = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=session_id,
            role="assistant",
            content=full_response,
            latency_ms=latency_ms,
        )
        await self._repo.add_message(assistant_msg)
