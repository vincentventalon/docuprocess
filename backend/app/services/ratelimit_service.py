"""In-memory rate limiting service using sliding window algorithm"""

import time
from dataclasses import dataclass
from typing import Dict
from collections import defaultdict


@dataclass
class RateLimitInfo:
    """Rate limit state for a request"""
    limit: int
    remaining: int
    reset: int
    allowed: bool


class RateLimitService:
    """
    In-memory rate limiter using sliding window.

    Note: State resets on backend restart/deploy and is not shared
    across Cloud Run instances. Sufficient for current scale.
    """

    def __init__(self):
        self._requests: Dict[str, list] = defaultdict(list)
        self.window_seconds = 60

    def check(self, team_id: str, limit: int) -> RateLimitInfo:
        """
        Check rate limit for a team and record the request if allowed.

        Args:
            team_id: Team identifier
            limit: Max requests allowed per window

        Returns:
            RateLimitInfo with current state
        """
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old requests outside the window
        self._requests[team_id] = [
            t for t in self._requests[team_id] if t > window_start
        ]

        count = len(self._requests[team_id])
        reset = int(now) + self.window_seconds

        if count >= limit:
            return RateLimitInfo(
                limit=limit,
                remaining=0,
                reset=reset,
                allowed=False
            )

        # Record this request
        self._requests[team_id].append(now)

        return RateLimitInfo(
            limit=limit,
            remaining=max(0, limit - count - 1),
            reset=reset,
            allowed=True
        )

    def get_current_usage(self, team_id: str, limit: int) -> RateLimitInfo:
        """
        Get current rate limit state without recording a request.
        Useful for read-only endpoints that want to show headers.

        Args:
            team_id: Team identifier
            limit: Max requests allowed per window

        Returns:
            RateLimitInfo with current state (always allowed=True)
        """
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old requests
        self._requests[team_id] = [
            t for t in self._requests[team_id] if t > window_start
        ]

        count = len(self._requests[team_id])
        reset = int(now) + self.window_seconds

        return RateLimitInfo(
            limit=limit,
            remaining=max(0, limit - count),
            reset=reset,
            allowed=True
        )


# Singleton instance
ratelimit_service = RateLimitService()
