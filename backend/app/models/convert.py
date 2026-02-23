"""Pydantic models for PDF conversion endpoints"""

from typing import Optional
from pydantic import BaseModel, Field, model_validator


class PdfToMarkdownRequest(BaseModel):
    """Request model for PDF to Markdown conversion"""

    url: Optional[str] = Field(
        default=None,
        description="URL of the PDF to convert (HTTPS only)",
        examples=["https://example.com/document.pdf"]
    )
    pdf_base64: Optional[str] = Field(
        default=None,
        description="Base64-encoded PDF content",
        examples=["JVBERi0xLjQK..."]
    )

    @model_validator(mode='after')
    def validate_input(self):
        """Ensure exactly one of url or pdf_base64 is provided"""
        if self.url and self.pdf_base64:
            raise ValueError("Provide either 'url' or 'pdf_base64', not both")
        if not self.url and not self.pdf_base64:
            raise ValueError("Must provide either 'url' or 'pdf_base64'")
        if self.url and not self.url.startswith("https://"):
            raise ValueError("URL must use HTTPS")
        return self

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "url": "https://example.com/document.pdf"
                },
                {
                    "pdf_base64": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC..."
                }
            ]
        }
    }


class PdfToMarkdownResponse(BaseModel):
    """Response model for PDF to Markdown conversion"""

    success: bool = Field(
        ...,
        description="Whether the conversion was successful",
        examples=[True]
    )
    markdown: str = Field(
        ...,
        description="Extracted markdown content",
        examples=["# Document Title\n\nThis is the document content..."]
    )
    page_count: int = Field(
        ...,
        description="Number of pages in the PDF",
        examples=[12]
    )
    credits_used: int = Field(
        ...,
        description="Number of credits consumed",
        examples=[1]
    )
    remaining_credits: int = Field(
        ...,
        description="Remaining credits after this operation",
        examples=[149]
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": True,
                    "markdown": "# Introduction\n\nThis document covers...",
                    "page_count": 12,
                    "credits_used": 1,
                    "remaining_credits": 149
                }
            ]
        }
    }


class ConversionError(BaseModel):
    """Error response for conversion failures"""

    success: bool = Field(default=False, examples=[False])
    error: str = Field(..., description="Error message", examples=["PDF file is corrupted"])
    code: str = Field(
        ...,
        description="Error code",
        examples=["INVALID_PDF", "URL_FETCH_FAILED", "FILE_TOO_LARGE", "INSUFFICIENT_CREDITS"]
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": False,
                    "error": "Failed to fetch PDF from URL",
                    "code": "URL_FETCH_FAILED"
                }
            ]
        }
    }
