"""Rate limiting dependency for V1 API endpoints"""

import time
from fastapi import Depends, HTTPException
from app.dependencies.auth import AuthenticatedUser, require_team_context
from app.services.ratelimit_service import ratelimit_service, RateLimitInfo

# Rate limits per minute by plan
RATE_LIMIT_FREE = 60
RATE_LIMIT_PAID = 120


def _get_limit_for_user(user: AuthenticatedUser) -> int:
    """Get rate limit based on user's plan"""
    return RATE_LIMIT_PAID if user.is_paid else RATE_LIMIT_FREE


async def check_rate_limit(
    user: AuthenticatedUser = Depends(require_team_context),
) -> RateLimitInfo:
    """
    Check rate limit and raise 429 if exceeded.
    Records the request against the team's quota.

    Use this for endpoints that consume resources (PDF generation, etc.)
    """
    limit = _get_limit_for_user(user)
    info = ratelimit_service.check(user.team_id, limit)

    if not info.allowed:
        retry_after = max(1, info.reset - int(time.time()))
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please retry after the reset time.",
            headers={
                "X-RateLimit-Limit": str(info.limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(info.reset),
                "Retry-After": str(retry_after),
            }
        )
    return info


async def get_rate_limit_info(
    user: AuthenticatedUser = Depends(require_team_context),
) -> RateLimitInfo:
    """
    Get current rate limit state without recording a request.
    Use this for read-only endpoints that want to include headers.
    """
    limit = _get_limit_for_user(user)
    return ratelimit_service.get_current_usage(user.team_id, limit)


def rate_limit_headers(info: RateLimitInfo) -> dict:
    """Helper to build rate limit headers dict"""
    return {
        "X-RateLimit-Limit": str(info.limit),
        "X-RateLimit-Remaining": str(info.remaining),
        "X-RateLimit-Reset": str(info.reset),
    }
