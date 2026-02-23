"""Template-related Pydantic models"""

from pydantic import BaseModel, Field
from typing import Dict, Any, Optional


class RenderTemplateRequest(BaseModel):
    """Request model for template rendering"""
    template_id: str = Field(
        ...,
        description="Template short ID (12 characters, e.g., 'HMQywVpZxqAM')",
        min_length=12,
        max_length=12
    )
    data: Dict[str, Any] = Field(..., description="Data to render in the template")

    class Config:
        json_schema_extra = {
            "example": {
                "template_id": "HMQywVpZxqAM",
                "data": {
                    "email": "hello@example.com",
                    "order_number": "12345",
                    "customer": {"name": "John Doe"}
                }
            }
        }


class RenderTemplateResponse(BaseModel):
    """Response metadata for template rendering"""
    success: bool
    remaining_credits: int
    message: Optional[str] = None
