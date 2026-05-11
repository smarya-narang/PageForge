"""
Simple in-memory IP-based rate limiter.
Limit: MAX_CALLS requests per WINDOW_SECONDS per IP.
Swap the store for Redis in production.
"""

import time
from collections import defaultdict
from threading import Lock

MAX_CALLS      = 10
WINDOW_SECONDS = 3600  # 1 hour

_store: dict[str, list[float]] = defaultdict(list)
_lock  = Lock()


def is_rate_limited(ip: str) -> bool:
    """Return True if the IP has exceeded the rate limit."""
    now = time.monotonic()
    cutoff = now - WINDOW_SECONDS

    with _lock:
        # Purge old timestamps
        _store[ip] = [t for t in _store[ip] if t > cutoff]

        if len(_store[ip]) >= MAX_CALLS:
            return True

        _store[ip].append(now)
        return False


def remaining(ip: str) -> int:
    """Return how many calls the IP has left in the current window."""
    now    = time.monotonic()
    cutoff = now - WINDOW_SECONDS
    with _lock:
        recent = [t for t in _store[ip] if t > cutoff]
        return max(0, MAX_CALLS - len(recent))
