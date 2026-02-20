from collections.abc import AsyncGenerator

import httpx

from src.config import settings


class OllamaClient:
    def __init__(self, base_url: str | None = None) -> None:
        self._base_url = base_url or settings.OLLAMA_HOST

    async def chat(self, model: str, messages: list[dict]) -> tuple[str, int]:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self._base_url}/api/chat",
                json={
                    "model": model,
                    "messages": messages,
                    "stream": False,
                },
            )
            response.raise_for_status()
            data = response.json()
            content = data.get("message", {}).get("content", "")
            token_count = data.get("eval_count", 0)
            return content, token_count

    async def stream_chat(
        self, model: str, messages: list[dict]
    ) -> AsyncGenerator[str, None]:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self._base_url}/api/chat",
                json={
                    "model": model,
                    "messages": messages,
                    "stream": True,
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        import json
                        data = json.loads(line)
                        content = data.get("message", {}).get("content", "")
                        if content:
                            yield content

    async def list_models(self) -> list[dict]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{self._base_url}/api/tags")
            response.raise_for_status()
            data = response.json()
            return [
                {
                    "name": m["name"],
                    "size": m.get("size", 0),
                    "modified_at": m.get("modified_at", ""),
                }
                for m in data.get("models", [])
            ]
