"""Pytest configuration and fixtures"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock, patch
from typing import Dict, Any

# Must import weasyprint_config first
import app.weasyprint_config  # noqa: F401

from app.main import app
from app.dependencies.auth import AuthenticatedUser


@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def mock_user():
    """Mock authenticated user with team context"""
    return AuthenticatedUser(
        user_id="test-user-id-123",
        email="test@example.com",
        auth_method="api_key",
        team_id="test-team-id-456",
        team_role="owner",
        is_paid=True,
    )


@pytest.fixture
def valid_api_key():
    """Valid API key for testing"""
    return "sk_test_valid_api_key_12345"


@pytest.fixture
def sample_template_data():
    """Sample template data for testing"""
    return {
        "email": "hello@yourcompany.com",
        "order_date": "2021-09-30",
        "order_number": "83472842",
        "order_status": "Complete",
        "ship_date": "2021-10-02",
        "customer": {
            "name": "Dyan Louise Martinez",
            "address1": "Orsis Pte Ltd",
            "address2": "2769 Nutter Street, Kansas City",
            "address3": "Missouri, 64105, USA"
        },
        "items": [
            {
                "description": "Bellroy Transit Backpack",
                "qty_ordered": 2,
                "qty_shipped": 2,
                "tracking_id": "83425812"
            },
            {
                "description": "Core Backpack 2.0 20L",
                "qty_ordered": 3,
                "qty_shipped": 3,
                "tracking_id": "76525878"
            }
        ],
        "note": "Please handle all items with care."
    }


@pytest.fixture
def sample_html_template():
    """Sample HTML template for testing"""
    return """<!DOCTYPE html>
<html>
<head><title>Test Template</title></head>
<body>
<h1>Order #{{order_number}}</h1>
<p>Email: {{email}}</p>
<p>Customer: {{customer.name}}</p>
<table>
<tbody>
<tr>
    <td>{{items.description}}</td>
    <td>{{items.qty_ordered}}</td>
</tr>
</tbody>
</table>
<p>Total: {{sum(items, 'qty_ordered')}}</p>
</body>
</html>"""


@pytest.fixture
def mock_auth(mock_user):
    """Mock authentication dependency (includes team context)"""
    from app.dependencies.auth import get_current_user, require_team_context
    from app.main import app

    # Override both dependencies - require_team_context depends on get_current_user
    def override_get_current_user():
        return mock_user

    def override_require_team_context():
        return mock_user

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[require_team_context] = override_require_team_context
    yield mock_user

    # Clean up: remove the override after the test
    app.dependency_overrides.clear()


@pytest.fixture
def mock_credits_available():
    """Mock atomic credit deduction - successful"""
    async def mock_deduct(*args, **kwargs):
        return {"success": True, "remaining_credits": 29}

    with patch("app.services.credit_service.credit_service.deduct_credit_atomic", side_effect=mock_deduct) as mock:
        yield mock


@pytest.fixture
def mock_credits_unavailable():
    """Mock atomic credit deduction - insufficient credits"""
    async def mock_deduct(*args, **kwargs):
        return {"success": False, "error": "Insufficient credits"}

    with patch("app.services.credit_service.credit_service.deduct_credit_atomic", side_effect=mock_deduct) as mock:
        yield mock


@pytest.fixture
def mock_decrement_credits():
    """Mock credit deduction (deprecated, kept for compatibility)"""
    async def mock_deduct(*args, **kwargs):
        return {"success": True, "remaining_credits": 29}

    with patch("app.services.credit_service.credit_service.deduct_credit_atomic", side_effect=mock_deduct) as mock:
        yield mock


@pytest.fixture
def mock_template_ownership_valid():
    """Mock template ownership validation - user owns template"""
    async def mock_verify(*args, **kwargs):
        return True

    with patch("app.services.template_service.template_service.verify_template_ownership", side_effect=mock_verify) as mock:
        yield mock


@pytest.fixture
def mock_template_ownership_invalid():
    """Mock template ownership validation - user doesn't own template"""
    async def mock_verify(*args, **kwargs):
        return False

    with patch("app.services.template_service.template_service.verify_template_ownership", side_effect=mock_verify) as mock:
        yield mock


@pytest.fixture
def mock_fetch_template(sample_html_template):
    """Mock template fetching from DB - returns (html, page_settings_db) tuple"""
    async def mock_fetch(*args, **kwargs):
        page_settings_db = {
            "padding": {"top": 12, "right": 12, "bottom": 12, "left": 12},
            "format": "A4",
            "orientation": "portrait",
        }
        return sample_html_template, page_settings_db

    with patch("app.services.template_service.template_service.fetch_template", side_effect=mock_fetch) as mock:
        yield mock


@pytest.fixture
def mock_rate_limit():
    """Mock rate limit check - always allow"""
    from app.services.ratelimit_service import RateLimitInfo
    from app.dependencies.ratelimit import check_rate_limit
    import time

    mock_info = RateLimitInfo(
        allowed=True,
        limit=120,
        remaining=119,
        reset=int(time.time()) + 60,
    )

    def override_rate_limit():
        return mock_info

    app.dependency_overrides[check_rate_limit] = override_rate_limit
    yield mock_info

    # Clean up
    if check_rate_limit in app.dependency_overrides:
        del app.dependency_overrides[check_rate_limit]
