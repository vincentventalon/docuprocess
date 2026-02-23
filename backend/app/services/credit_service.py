"""Credit management service - Team-based credit system"""

import asyncio
import logging
from typing import Dict, Optional
from app.core.supabase import get_supabase

logger = logging.getLogger(__name__)


class CreditService:
    """Service for managing team credits"""

    async def has_enough_credits(self, team_id: str, required_credits: int = 1) -> bool:
        """
        Check if team has enough credits

        Args:
            team_id: Team ID
            required_credits: Number of credits required (default: 1)

        Returns:
            True if team has enough credits, False otherwise
        """
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: get_supabase().table("teams").select("credits").eq("id", team_id).single().execute()
            )

            if not response.data:
                return False

            credits = response.data.get("credits", 0)
            return credits >= required_credits

        except Exception as e:
            logger.error(f"Error checking credits for team {team_id}: {str(e)}")
            return False

    async def deduct_credit_atomic(
        self,
        team_id: str,
        user_id: str,
        amount: int = 1,
        resource_id: Optional[str] = None,
        api_key_id: Optional[str] = None
    ) -> Dict:
        """
        Atomically deduct team credits (prevents race conditions)

        Uses a single UPDATE with WHERE condition to ensure atomic operation.
        This prevents race conditions where multiple requests could pass
        credit checks simultaneously.

        Args:
            team_id: Team ID
            user_id: User ID (for transaction logging)
            amount: Number of credits to deduct (default: 1)
            resource_id: Resource ID for logging (optional)
            api_key_id: API key UUID for tracking which key was used (optional)

        Returns:
            Dictionary with success status and remaining credits
            {"success": True/False, "remaining_credits": int, "error"?: str}
        """
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: get_supabase().rpc(
                    'deduct_credit_atomic_team',
                    {
                        'p_team_id': team_id,
                        'p_user_id': user_id,
                        'p_amount': amount,
                        'p_resource_id': resource_id,
                        'p_api_key_id': api_key_id
                    }
                ).execute()
            )

            if response.data:
                result = response.data
                if result.get('success'):
                    logger.info(
                        f"Atomically deducted {amount} credit(s) for team {team_id}. "
                        f"Remaining: {result.get('remaining_credits')}"
                    )
                return result

            return {"success": False, "error": "RPC call failed"}

        except Exception as e:
            logger.error(f"Error in atomic credit deduction for team {team_id}: {str(e)}")
            return {"success": False, "error": str(e)}

    async def refund_credit(
        self,
        team_id: str,
        user_id: str,
        amount: int = 1,
        resource_id: Optional[str] = None
    ) -> Dict:
        """
        Refund credits to team (used when operation fails after deduction)

        Args:
            team_id: Team ID
            user_id: User ID (for transaction logging)
            amount: Number of credits to refund (default: 1)
            resource_id: Resource ID for logging (optional)

        Returns:
            Dictionary with success status and remaining credits
            {"success": True/False, "remaining_credits": int}
        """
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: get_supabase().rpc(
                    'refund_credit_team',
                    {
                        'p_team_id': team_id,
                        'p_user_id': user_id,
                        'p_amount': amount,
                        'p_resource_id': resource_id
                    }
                ).execute()
            )

            if response.data:
                result = response.data
                if result.get('success'):
                    logger.info(
                        f"Refunded {amount} credit(s) for team {team_id}. "
                        f"Remaining: {result.get('remaining_credits')}"
                    )
                return result

            return {"success": False, "error": "RPC call failed"}

        except Exception as e:
            logger.error(f"Error refunding credits for team {team_id}: {str(e)}")
            return {"success": False, "error": str(e)}

    async def get_credits(self, team_id: str) -> int:
        """
        Get team's current credit balance

        Args:
            team_id: Team ID

        Returns:
            Number of credits (0 if error)
        """
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: get_supabase().table("teams").select("credits").eq("id", team_id).single().execute()
            )

            if response.data:
                return response.data.get("credits", 0)

            return 0

        except Exception as e:
            logger.error(f"Error getting credits for team {team_id}: {str(e)}")
            return 0


# Singleton instance
credit_service = CreditService()
