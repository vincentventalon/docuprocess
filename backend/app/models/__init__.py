"""Pydantic models for API requests and responses"""

from app.models.template import RenderTemplateRequest, RenderTemplateResponse

__all__ = [
    "RenderTemplateRequest",
    "RenderTemplateResponse",
]
