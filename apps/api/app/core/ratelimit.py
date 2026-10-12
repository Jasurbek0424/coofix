"""Fixed-window rate limiting. Redis in prod; in-process fallback for dev/tests."""

import time
from collections.abc import Callable

from fastapi import Request
from redis.asyncio import Redis

from app.core.config import get_settings
from app.core.errors import AppError


class _MemoryBackend:
    def __init__(self) -> None:
        self._hits: dict[str, tuple[int, float]] = {}

    async def hit(self, key: str, window: int) -> int:
        now = time.monotonic()
        count, reset = self._hits.get(key, (0, now + window))
        if now >= reset:
            count, reset = 0, now + window
        count += 1
        self._hits[key] = (count, reset)
        return count

    def reset(self) -> None:
        self._hits.clear()


class _RedisBackend:
    def __init__(self, url: str) -> None:
        self._redis = Redis.from_url(url)

    async def hit(self, key: str, window: int) -> int:
        async with self._redis.pipeline(transaction=True) as pipe:
            pipe.incr(key)
            pipe.expire(key, window, nx=True)
            count, _ = await pipe.execute()
        return int(count)


_settings = get_settings()
backend: _MemoryBackend | _RedisBackend = (
    _RedisBackend(_settings.redis_url) if _settings.redis_url else _MemoryBackend()
)


def client_ip(request: Request) -> str:
    # uvicorn runs with --proxy-headers behind nginx, so request.client is the real peer.
    return request.client.host if request.client else "unknown"


def rate_limit(scope: str, limit: int, window_seconds: int) -> Callable:
    """FastAPI dependency: at most `limit` requests per IP per window for this scope."""

    async def dependency(request: Request) -> None:
        key = f"rl:{scope}:{client_ip(request)}"
        if await backend.hit(key, window_seconds) > limit:
            raise AppError(429, "rate_limited", "Too many requests, try again later")

    return dependency


async def check_key(scope: str, key: str, limit: int, window_seconds: int) -> None:
    """Imperative variant for keys known only inside the handler (e.g. login email)."""
    if await backend.hit(f"rl:{scope}:{key}", window_seconds) > limit:
        raise AppError(429, "rate_limited", "Too many requests, try again later")
