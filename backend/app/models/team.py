"""Team-related Pydantic models"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field
from uuid import UUID


class Team(BaseModel):
    """Represents a team"""
    id: UUID
    name: str
    slug: str
    owner_id: UUID
    api_key: Optional[str] = None
    credits: int = 100
    customer_id: Optional[str] = None
    price_id: Optional[str] = None
    has_paid: bool = False
    settings: dict = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime


class TeamMember(BaseModel):
    """Represents a team membership"""
    id: UUID
    team_id: UUID
    user_id: UUID
    role: Literal["owner", "admin", "member"]
    invited_by: Optional[UUID] = None
    joined_at: datetime


class TeamInvitation(BaseModel):
    """Represents a pending team invitation"""
    id: UUID
    team_id: UUID
    email: str
    token: str
    role: Literal["admin", "member"]
    invited_by: UUID
    expires_at: datetime
    created_at: datetime


class TeamWithRole(BaseModel):
    """Team with the current user's role"""
    id: UUID
    name: str
    slug: str
    owner_id: UUID
    credits: int
    has_paid: bool
    role: Literal["owner", "admin", "member"]
    settings: dict = Field(default_factory=dict)


class TeamSummary(BaseModel):
    """Brief team info for listing"""
    id: UUID
    name: str
    slug: str
    role: Literal["owner", "admin", "member"]
    credits: int
    has_paid: bool


# Request/Response models
class CreateTeamRequest(BaseModel):
    """Request to create a new team"""
    name: str = Field(..., min_length=1, max_length=100)


class UpdateTeamRequest(BaseModel):
    """Request to update team settings"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    settings: Optional[dict] = None


class InviteMemberRequest(BaseModel):
    """Request to invite a member to a team"""
    email: str = Field(..., description="Email to invite")
    role: Literal["admin", "member"] = Field(default="member")


class SwitchTeamRequest(BaseModel):
    """Request to switch active team"""
    team_id: UUID


class TeamMemberResponse(BaseModel):
    """Team member with user info"""
    id: UUID
    user_id: UUID
    email: Optional[str] = None
    name: Optional[str] = None
    role: Literal["owner", "admin", "member"]
    joined_at: datetime


class InvitationResponse(BaseModel):
    """Invitation details for display"""
    id: UUID
    team_id: UUID
    team_name: str
    email: str
    role: Literal["admin", "member"]
    expires_at: datetime
    created_at: datetime
