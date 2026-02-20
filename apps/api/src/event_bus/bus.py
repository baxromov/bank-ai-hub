from collections import defaultdict
from collections.abc import Callable, Awaitable
from typing import Any

from src.event_bus.events import DomainEvent


EventHandler = Callable[[DomainEvent], Awaitable[None]]


class EventBus:
    def __init__(self) -> None:
        self._handlers: dict[type[DomainEvent], list[EventHandler]] = defaultdict(list)

    def subscribe(self, event_type: type[DomainEvent], handler: EventHandler) -> None:
        self._handlers[event_type].append(handler)

    async def publish(self, event: DomainEvent) -> None:
        for handler in self._handlers[type(event)]:
            await handler(event)


event_bus = EventBus()
