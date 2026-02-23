"""V1 Account API endpoint for account info and transactions"""

import asyncio
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.dependencies.auth import require_team_context, AuthenticatedUser
from app.dependencies.ratelimit import get_rate_limit_info, rate_limit_headers
from app.services.ratelimit_service import RateLimitInfo
from app.services.credit_service import credit_service
from app.core.supabase import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter()


class AccountInfoResponse(BaseModel):
    """Response for account info endpoint"""
    credits: int = Field(..., description="Remaining credits", examples=[150])
    email: Optional[str] = Field(default=None, description="User email address", examples=["user@example.com"])

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "credits": 150,
                    "email": "user@example.com",
                }
            ]
        }
    }


class Transaction(BaseModel):
    """Transaction record"""
    transaction_ref: str = Field(..., description="Unique transaction reference (UUID)", examples=["550e8400-e29b-41d4-a716-446655440000"])
    transaction_type: str = Field(..., description="Transaction type: USAGE, PURCHASE, REFUND, BONUS", examples=["USAGE"])
    resource_id: Optional[str] = Field(default=None, description="Resource ID (for USAGE)", examples=["abc123"])
    exec_tm: Optional[int] = Field(default=None, description="Execution time in milliseconds", examples=[1250])
    credits: int = Field(..., description="Credits consumed (positive) or added (negative)", examples=[1])
    created_at: str = Field(..., description="ISO 8601 timestamp", examples=["2024-01-20T14:30:00Z"])


class TransactionsResponse(BaseModel):
    """Response for transactions list endpoint"""
    transactions: List[Transaction]
    total: int = Field(..., description="Total number of transactions", examples=[42])
    limit: int = Field(..., description="Number of records returned", examples=[300])
    offset: int = Field(..., description="Number of records skipped", examples=[0])

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "transactions": [
                        {
                            "transaction_ref": "550e8400-e29b-41d4-a716-446655440000",
                            "transaction_type": "USAGE",
                            "resource_id": "abc123",
                            "exec_tm": 1250,
                            "credits": 1,
                            "created_at": "2024-01-20T14:30:00Z",
                        },
                        {
                            "transaction_ref": "660e8400-e29b-41d4-a716-446655440001",
                            "transaction_type": "PURCHASE",
                            "resource_id": None,
                            "exec_tm": None,
                            "credits": -100,
                            "created_at": "2024-01-15T10:00:00Z",
                        },
                    ],
                    "total": 42,
                    "limit": 300,
                    "offset": 0,
                }
            ]
        }
    }


@router.get(
    "",
    operation_id="getAccount",
    response_model=AccountInfoResponse,
    summary="Get account info",
    description="""
Get account information including remaining credits.

**Authentication:** API Key required (`x-api-key` header) or JWT token

**Usage:** Check credit balance before performing operations.

**No credits consumed:** This is a read-only endpoint.

**Rate Limits:** 60 requests/min (free), 120 requests/min (paid). Headers included in response.
""",
    responses={
        200: {
            "description": "Account information",
            "content": {
                "application/json": {
                    "example": {
                        "credits": 150,
                        "email": "user@example.com",
                    }
                }
            },
        },
        403: {"description": "Invalid or missing API key"},
    },
)
async def get_account_info(
    user: AuthenticatedUser = Depends(require_team_context),
    rate_limit: RateLimitInfo = Depends(get_rate_limit_info),
):
    """Get account info with credits (team-based)"""
    logger.info(f"V1 Account info: user={user.user_id}, team={user.team_id}")

    credits = await credit_service.get_credits(user.team_id)

    return JSONResponse(
        content=AccountInfoResponse(
            credits=credits,
            email=user.email
        ).model_dump(),
        headers=rate_limit_headers(rate_limit),
    )


@router.get(
    "/transactions",
    operation_id="listTransactions",
    response_model=TransactionsResponse,
    summary="List transactions",
    description="""
List transaction history for the authenticated team.

**Authentication:** API Key required (`x-api-key` header) or JWT token

**Pagination:** Use `limit` and `offset` query parameters.

**Transaction types:**
- `USAGE`: Credit usage (consumes credits)
- `REFUND`: Credit refund
- `PURCHASE`: Credit purchase
- `BONUS`: Bonus credits

**Credits field:**
- Positive value = credits consumed
- Negative value = credits added

**No credits consumed:** This is a read-only endpoint.

**Rate Limits:** 60 requests/min (free), 120 requests/min (paid). Headers included in response.
""",
    responses={
        200: {
            "description": "Transaction history",
            "content": {
                "application/json": {
                    "example": {
                        "transactions": [
                            {
                                "transaction_ref": "550e8400-e29b-41d4-a716-446655440000",
                                "transaction_type": "USAGE",
                                "resource_id": "abc123",
                                "exec_tm": 1250,
                                "credits": 1,
                                "created_at": "2024-01-20T14:30:00Z",
                            },
                            {
                                "transaction_ref": "660e8400-e29b-41d4-a716-446655440001",
                                "transaction_type": "PURCHASE",
                                "resource_id": None,
                                "exec_tm": None,
                                "credits": -100,
                                "created_at": "2024-01-15T10:00:00Z",
                            },
                        ],
                        "total": 42,
                        "limit": 300,
                        "offset": 0,
                    }
                }
            },
        },
        403: {"description": "Invalid or missing API key"},
    },
)
async def list_transactions(
    user: AuthenticatedUser = Depends(require_team_context),
    rate_limit: RateLimitInfo = Depends(get_rate_limit_info),
    limit: int = Query(default=300, ge=1, le=1000, description="Number of records to return"),
    offset: int = Query(default=0, ge=0, description="Number of records to skip"),
):
    """List transaction history (team-based)"""
    logger.info(f"V1 Transactions list: user={user.user_id}, team={user.team_id}, limit={limit}, offset={offset}")

    try:
        supabase = get_supabase()
        loop = asyncio.get_event_loop()

        # Get total count (non-blocking) - filter by team_id
        count_response = await loop.run_in_executor(
            None,
            lambda: (
                supabase.table("transactions")
                .select("id", count="exact")
                .eq("team_id", user.team_id)
                .execute()
            )
        )
        total = count_response.count or 0

        # Get paginated transactions (non-blocking) - filter by team_id
        response = await loop.run_in_executor(
            None,
            lambda: (
                supabase.table("transactions")
                .select("transaction_ref, transaction_type, resource_id, exec_tm, credits, created_at")
                .eq("team_id", user.team_id)
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
        )

        transactions = []
        for t in response.data or []:
            transactions.append(Transaction(
                transaction_ref=str(t["transaction_ref"]),
                transaction_type=t["transaction_type"],
                resource_id=t.get("resource_id"),
                exec_tm=t.get("exec_tm"),
                credits=t["credits"],
                created_at=t["created_at"],
            ))

        return JSONResponse(
            content=TransactionsResponse(
                transactions=transactions,
                total=total,
                limit=limit,
                offset=offset
            ).model_dump(),
            headers=rate_limit_headers(rate_limit),
        )

    except Exception as e:
        logger.error(f"Error listing transactions for user {user.user_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list transactions: {str(e)}"
        )
