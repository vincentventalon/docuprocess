"""Authentication utilities for JWT and API key validation"""

import asyncio
from fastapi import HTTPException, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Literal
import logging

from app.core.supabase import get_supabase

logger = logging.getLogger(__name__)

# HTTP Bearer for JWT token extraction
security = HTTPBearer(auto_error=False)


class AuthenticatedUser:
    """Represents an authenticated user from either JWT or API key"""
    def __init__(
        self,
        user_id: str,
        email: Optional[str] = None,
        auth_method: str = "unknown",
        is_admin: bool = False,
        team_id: Optional[str] = None,
        team_role: Optional[Literal["owner", "admin", "member"]] = None,
        is_paid: bool = False,
        api_key_id: Optional[str] = None,
        is_impersonating: bool = False,
    ):
        self.user_id = user_id
        self.email = email
        self.auth_method = auth_method  # "jwt" or "api_key"
        self.is_admin = is_admin
        # Team context
        self.team_id = team_id
        self.team_role = team_role
        self.is_paid = is_paid
        # API key tracking (for analytics)
        self.api_key_id = api_key_id
        # Admin impersonation flag
        self.is_impersonating = is_impersonating


async def _get_team_context(
    user_id: str,
    team_id: Optional[str] = None,
    is_admin: bool = False,
) -> dict:
    """
    Get team context for a user.
    If team_id is provided, use that team (if user is a member OR if user is admin).
    Otherwise, use user's last_team_id.

    Returns dict with team_id, team_role, is_paid, is_impersonating
    """
    loop = asyncio.get_event_loop()

    # ADMIN BYPASS: Allow admins to view any team without membership
    if is_admin and team_id:
        try:
            team_response = await loop.run_in_executor(
                None,
                lambda: get_supabase().table("teams")
                    .select("id, has_paid")
                    .eq("id", team_id)
                    .single()
                    .execute()
            )
            if team_response.data:
                return {
                    "team_id": team_id,
                    "team_role": "owner",  # Grant owner role for full visibility
                    "is_paid": team_response.data.get("has_paid", False),
                    "is_impersonating": True,
                }
        except Exception as e:
            logger.warning(f"Admin team lookup failed for team {team_id}: {e}")
            # Fall through to normal membership check

    # If no team_id specified, get from profile's last_team_id
    if not team_id:
        try:
            profile_response = await loop.run_in_executor(
                None,
                lambda: get_supabase().table("profiles").select("last_team_id").eq("id", user_id).single().execute()
            )
            if profile_response.data and profile_response.data.get("last_team_id"):
                team_id = profile_response.data["last_team_id"]
        except Exception as e:
            logger.warning(f"Failed to get user's last_team_id: {e}")

    if not team_id:
        return {"team_id": None, "team_role": None, "is_paid": False, "is_impersonating": False}

    # Get membership and team info
    try:
        member_response = await loop.run_in_executor(
            None,
            lambda: get_supabase().table("team_members")
                .select("role, teams(id, has_paid)")
                .eq("user_id", user_id)
                .eq("team_id", team_id)
                .single()
                .execute()
        )
        if member_response.data:
            team_data = member_response.data.get("teams", {})
            return {
                "team_id": team_id,
                "team_role": member_response.data.get("role"),
                "is_paid": team_data.get("has_paid", False) if team_data else False,
                "is_impersonating": False,
            }
    except Exception as e:
        logger.warning(f"Failed to get team context: {e}")

    return {"team_id": None, "team_role": None, "is_paid": False, "is_impersonating": False}


async def verify_jwt_token(token: str, x_team_id: Optional[str] = None) -> Optional[AuthenticatedUser]:
    """
    Verify a Supabase JWT token

    Args:
        token: JWT token from Authorization header
        x_team_id: Optional team ID from X-Team-ID header

    Returns:
        AuthenticatedUser if valid, None otherwise
    """
    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: get_supabase().auth.get_user(token)
        )

        if response and response.user:
            # Fetch is_admin from profiles
            is_admin = False
            try:
                profile_response = await loop.run_in_executor(
                    None,
                    lambda: get_supabase().table("profiles").select("is_admin").eq("id", response.user.id).single().execute()
                )
                if profile_response.data:
                    is_admin = profile_response.data.get("is_admin", False)
            except Exception:
                pass

            # Get team context (pass is_admin for impersonation support)
            team_context = await _get_team_context(response.user.id, x_team_id, is_admin=is_admin)

            return AuthenticatedUser(
                user_id=response.user.id,
                email=response.user.email,
                auth_method="jwt",
                is_admin=is_admin,
                **team_context,
            )
        return None

    except Exception as e:
        logger.warning(f"JWT verification failed: {str(e)}")
        return None


async def verify_api_key(api_key: str) -> Optional[AuthenticatedUser]:
    """
    Verify an API key against the team_api_keys table.
    API keys are team-owned and can be revoked.

    Args:
        api_key: API key from x-api-key header

    Returns:
        AuthenticatedUser if valid, None otherwise
    """
    try:
        loop = asyncio.get_event_loop()
        # Query team_api_keys table for matching active (non-revoked) key
        response = await loop.run_in_executor(
            None,
            lambda: get_supabase().table("team_api_keys")
                .select("id, team_id, teams(owner_id, has_paid)")
                .eq("api_key", api_key)
                .is_("revoked_at", "null")
                .single()
                .execute()
        )

        if response.data:
            key_data = response.data
            api_key_id = key_data["id"]
            team_id = key_data["team_id"]
            team = key_data.get("teams", {})
            owner_id = team.get("owner_id")
            has_paid = team.get("has_paid", False)

            if not owner_id:
                logger.warning(f"API key {api_key_id} has no associated team owner")
                return None

            # Get owner's email and admin status
            email = None
            is_admin = False
            try:
                profile_response = await loop.run_in_executor(
                    None,
                    lambda: get_supabase().table("profiles").select("email, is_admin").eq("id", owner_id).single().execute()
                )
                if profile_response.data:
                    email = profile_response.data.get("email")
                    is_admin = profile_response.data.get("is_admin", False)
            except Exception:
                pass

            return AuthenticatedUser(
                user_id=owner_id,
                email=email,
                auth_method="api_key",
                is_admin=is_admin,
                team_id=team_id,
                team_role="owner",  # API key implies owner-level access
                is_paid=has_paid,
                api_key_id=api_key_id,
            )
        return None

    except Exception as e:
        logger.error(f"API key verification failed: {str(e)}")
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    x_api_key: Optional[str] = Header(None, alias="x-api-key", include_in_schema=False),
    x_team_id: Optional[str] = Header(None, alias="x-team-id", include_in_schema=False),
) -> AuthenticatedUser:
    """
    Dependency to get the current authenticated user.
    Supports two authentication methods:
    1. JWT token in Authorization header (for frontend requests)
    2. API key in x-api-key header (for direct API calls)

    Team context is determined by:
    - API key: team that owns the API key
    - JWT: X-Team-ID header or user's last_team_id

    Args:
        credentials: Bearer token from Authorization header
        x_api_key: API key from x-api-key header
        x_team_id: Team ID from x-team-id header (for JWT auth)

    Returns:
        AuthenticatedUser object with team context

    Raises:
        HTTPException: If authentication fails
    """
    user = None

    # Try JWT authentication first (if Authorization header present)
    if credentials and credentials.credentials:
        user = await verify_jwt_token(credentials.credentials, x_team_id)
        if user:
            logger.info(f"User authenticated via JWT: {user.user_id} (team: {user.team_id})")
            return user

    # Try API key authentication (if x-api-key header present)
    if x_api_key:
        user = await verify_api_key(x_api_key)
        if user:
            logger.info(f"User authenticated via API key: {user.user_id} (team: {user.team_id})")
            return user

    # No valid authentication found
    raise HTTPException(
        status_code=401,
        detail="Invalid authentication. Provide either a valid JWT token (Authorization: Bearer <token>) or API key (x-api-key: <key>)",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_admin(
    user: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    """
    Dependency that requires the current user to be an admin.
    Raises 403 if the user is not an admin.
    """
    if not user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )
    return user


async def require_team_context(
    user: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    """
    Dependency that requires a valid team context.
    Raises 403 if user is not a member of any team.
    """
    if not user.team_id:
        raise HTTPException(
            status_code=403,
            detail="No team context. User must be a member of a team.",
        )
    return user


async def require_team_owner(
    user: AuthenticatedUser = Depends(require_team_context),
) -> AuthenticatedUser:
    """
    Dependency that requires the user to be a team owner.
    Raises 403 if user is not the owner of the current team.
    """
    if user.team_role != "owner":
        raise HTTPException(
            status_code=403,
            detail="Team owner access required",
        )
    return user


async def require_team_admin(
    user: AuthenticatedUser = Depends(require_team_context),
) -> AuthenticatedUser:
    """
    Dependency that requires the user to be a team admin or owner.
    Raises 403 if user is not admin/owner of the current team.
    """
    if user.team_role not in ("owner", "admin"):
        raise HTTPException(
            status_code=403,
            detail="Team admin access required",
        )
    return user


async def require_paid_team(
    user: AuthenticatedUser = Depends(require_team_context),
) -> AuthenticatedUser:
    """
    Dependency that requires the team to have an active subscription.
    Raises 403 if team is not paid.
    """
    if not user.is_paid:
        raise HTTPException(
            status_code=403,
            detail="Paid subscription required. Please upgrade your team plan.",
        )
    return user
