from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[user_id].append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        if user_id in self._connections:
            self._connections[user_id] = [
                ws for ws in self._connections[user_id] if ws != websocket
            ]
            if not self._connections[user_id]:
                del self._connections[user_id]

    async def send_to_user(self, user_id: str, data: dict) -> None:
        if user_id in self._connections:
            disconnected = []
            for ws in self._connections[user_id]:
                try:
                    await ws.send_json(data)
                except Exception:
                    disconnected.append(ws)
            for ws in disconnected:
                self.disconnect(user_id, ws)

    async def broadcast(self, data: dict) -> None:
        for user_id in list(self._connections.keys()):
            await self.send_to_user(user_id, data)


ws_manager = ConnectionManager()
