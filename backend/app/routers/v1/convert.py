"""V1 Convert API endpoint for PDF to Markdown conversion"""

import logging
import time
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from app.dependencies.auth import require_team_context, AuthenticatedUser
from app.dependencies.ratelimit import check_rate_limit, rate_limit_headers
from app.services.ratelimit_service import RateLimitInfo
from app.services.credit_service import credit_service
from app.services.pdf_converter_service import pdf_converter_service
from app.models.convert import (
    PdfToMarkdownRequest,
    PdfToMarkdownResponse,
    ConversionError,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/pdf-to-markdown",
    operation_id="convertPdfToMarkdown",
    response_model=PdfToMarkdownResponse,
    summary="Convert PDF to Markdown",
    description="""
Convert a PDF document to clean Markdown format.

**Authentication:** API Key required (`x-api-key` header) or JWT token

**Input options (provide exactly one):**
- `url`: HTTPS URL of a publicly accessible PDF
- `pdf_base64`: Base64-encoded PDF content

**Output:** Markdown text with preserved structure, headings, tables, and formatting.

**Limits:**
- Maximum file size: 10MB
- HTTPS URLs only (no HTTP)
- Private/internal URLs are blocked for security

**Credits:** 1 credit per conversion

**Rate Limits:** 60 requests/min (free), 120 requests/min (paid)
""",
    responses={
        200: {
            "description": "Conversion successful",
            "model": PdfToMarkdownResponse,
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "markdown": "# Introduction\n\nThis document covers...",
                        "page_count": 12,
                        "credits_used": 1,
                        "remaining_credits": 149
                    }
                }
            },
        },
        400: {
            "description": "Invalid request (bad URL, invalid PDF, etc.)",
            "model": ConversionError,
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "error": "URL must use HTTPS",
                        "code": "INVALID_URL"
                    }
                }
            },
        },
        402: {
            "description": "Insufficient credits",
            "model": ConversionError,
        },
        403: {"description": "Invalid or missing API key"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def convert_pdf_to_markdown(
    request: PdfToMarkdownRequest,
    user: AuthenticatedUser = Depends(require_team_context),
    rate_limit: RateLimitInfo = Depends(check_rate_limit),
):
    """Convert PDF to Markdown with authentication and credit deduction"""

    start_time = time.time()
    resource_id = str(uuid4())

    logger.info(
        f"PDF conversion request: user={user.user_id}, team={user.team_id}, "
        f"url={bool(request.url)}, base64={bool(request.pdf_base64)}"
    )

    # Deduct credit atomically before processing
    deduction_result = await credit_service.deduct_credit_atomic(
        team_id=user.team_id,
        user_id=user.user_id,
        amount=1,
        resource_id=resource_id,
        api_key_id=user.api_key_id,
    )

    if not deduction_result.get("success"):
        error_msg = deduction_result.get("error", "Insufficient credits")
        logger.warning(f"Credit deduction failed for team {user.team_id}: {error_msg}")

        return JSONResponse(
            status_code=402,
            content=ConversionError(
                success=False,
                error="Insufficient credits. Please purchase more credits.",
                code="INSUFFICIENT_CREDITS"
            ).model_dump(),
            headers=rate_limit_headers(rate_limit),
        )

    remaining_credits = deduction_result.get("remaining_credits", 0)

    try:
        # Perform the conversion
        result = await pdf_converter_service.convert(
            url=request.url,
            pdf_base64=request.pdf_base64
        )

        if not result.success:
            # Refund credit on conversion failure
            await credit_service.refund_credit(
                team_id=user.team_id,
                user_id=user.user_id,
                amount=1,
                resource_id=resource_id,
            )
            remaining_credits += 1

            logger.warning(
                f"PDF conversion failed for team {user.team_id}: "
                f"{result.error_code} - {result.error}"
            )

            return JSONResponse(
                status_code=400,
                content=ConversionError(
                    success=False,
                    error=result.error or "Conversion failed",
                    code=result.error_code or "CONVERSION_FAILED"
                ).model_dump(),
                headers=rate_limit_headers(rate_limit),
            )

        exec_time_ms = int((time.time() - start_time) * 1000)
        logger.info(
            f"PDF conversion successful: team={user.team_id}, "
            f"pages={result.page_count}, exec_time={exec_time_ms}ms"
        )

        return JSONResponse(
            content=PdfToMarkdownResponse(
                success=True,
                markdown=result.markdown,
                page_count=result.page_count,
                credits_used=1,
                remaining_credits=remaining_credits
            ).model_dump(),
            headers=rate_limit_headers(rate_limit),
        )

    except Exception as e:
        # Refund credit on unexpected error
        await credit_service.refund_credit(
            team_id=user.team_id,
            user_id=user.user_id,
            amount=1,
            resource_id=resource_id,
        )

        logger.error(f"Unexpected error in PDF conversion: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during conversion"
        )
