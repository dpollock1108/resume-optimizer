import os
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException


_requests = defaultdict(deque)
_lock = Lock()


def enforce_ai_rate_limit(user_id: str) -> None:
    limit = int(os.getenv("AI_REQUESTS_PER_HOUR", "10"))
    cutoff = time.monotonic() - 3600

    with _lock:
        user_requests = _requests[user_id]
        while user_requests and user_requests[0] < cutoff:
            user_requests.popleft()
        if len(user_requests) >= limit:
            raise HTTPException(
                status_code=429,
                detail="Hourly AI request limit reached. Please try again later.",
            )
        user_requests.append(time.monotonic())
