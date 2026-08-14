"""Pub/sub behind a narrow interface.

Real-time delivery needs a broker. On a single Render instance an in-process
implementation is exactly correct and costs nothing; the Redis one behind the
same protocol is what makes horizontal scaling a config change rather than a
rewrite.
"""

from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator
from typing import Any, Protocol

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

#: Bounded so a slow or abandoned websocket cannot grow a queue without limit.
_QUEUE_MAX = 256


def order_channel(order_id: int) -> str:
    return f"order:{order_id}"


def canteen_queue_channel(canteen_id: int) -> str:
    return f"canteen:{canteen_id}:orders"


def user_channel(user_id: str) -> str:
    return f"user:{user_id}"


class PubSub(Protocol):
    async def publish(self, channel: str, message: dict[str, Any]) -> None: ...

    def subscribe(self, channel: str) -> AsyncIterator[dict[str, Any]]: ...

    async def close(self) -> None: ...


class InProcessPubSub:
    """Fan-out to subscribers inside this worker process."""

    def __init__(self) -> None:
        self._subscribers: dict[str, set[asyncio.Queue]] = {}
        self._lock = asyncio.Lock()

    async def publish(self, channel: str, message: dict[str, Any]) -> None:
        async with self._lock:
            queues = list(self._subscribers.get(channel, ()))

        for queue in queues:
            try:
                queue.put_nowait(message)
            except asyncio.QueueFull:
                # Drop for this subscriber rather than blocking the publisher,
                # which is on the request path for status changes.
                logger.warning(
                    "Dropped realtime message for a slow subscriber",
                    extra={"channel": channel},
                )

    async def subscribe(self, channel: str) -> AsyncIterator[dict[str, Any]]:
        queue: asyncio.Queue = asyncio.Queue(maxsize=_QUEUE_MAX)
        async with self._lock:
            self._subscribers.setdefault(channel, set()).add(queue)

        try:
            while True:
                yield await queue.get()
        finally:
            async with self._lock:
                subscribers = self._subscribers.get(channel)
                if subscribers is not None:
                    subscribers.discard(queue)
                    if not subscribers:
                        del self._subscribers[channel]

    async def close(self) -> None:
        async with self._lock:
            self._subscribers.clear()


class RedisPubSub:
    """Cross-process fan-out. Selected automatically when REDIS_URL is set."""

    def __init__(self, url: str) -> None:
        from redis.asyncio import Redis  # imported lazily; optional dependency

        self._redis = Redis.from_url(url, decode_responses=True)

    async def publish(self, channel: str, message: dict[str, Any]) -> None:
        await self._redis.publish(channel, json.dumps(message, default=str))

    async def subscribe(self, channel: str) -> AsyncIterator[dict[str, Any]]:
        pubsub = self._redis.pubsub()
        await pubsub.subscribe(channel)
        try:
            async for raw in pubsub.listen():
                if raw.get("type") != "message":
                    continue
                try:
                    yield json.loads(raw["data"])
                except (TypeError, ValueError):
                    logger.warning(
                        "Discarded malformed realtime payload",
                        extra={"channel": channel},
                    )
        finally:
            await pubsub.unsubscribe(channel)
            await pubsub.aclose()

    async def close(self) -> None:
        await self._redis.aclose()


_broker: PubSub | None = None


def get_pubsub() -> PubSub:
    global _broker
    if _broker is None:
        if settings.redis_url:
            logger.info("Using Redis pub/sub for realtime delivery")
            _broker = RedisPubSub(settings.redis_url)
        else:
            logger.info("Using in-process pub/sub for realtime delivery")
            _broker = InProcessPubSub()
    return _broker


async def close_pubsub() -> None:
    global _broker
    if _broker is not None:
        await _broker.close()
        _broker = None
