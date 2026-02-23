# Template API Tests

Comprehensive pytest test suite for the template rendering API.

## Installation

Install test dependencies:

```bash
# Using pip
pip install -e ".[dev]"

# Or using uv (if you're using uv)
uv pip install -e ".[dev]"
```

## Running Tests

### Quick start

```bash
# Run all tests
pytest

# Or use the test runner script
./run_tests.sh
```

### Test runner options

```bash
# Run all tests (default)
./run_tests.sh all

# Run only fast tests (exclude slow tests)
./run_tests.sh fast

# Run with coverage report
./run_tests.sh coverage

# Run with verbose output (shows print statements)
./run_tests.sh verbose

# Re-run only failed tests from last run
./run_tests.sh failed

# Run specific test file or test
./run_tests.sh specific tests/test_template_api.py
./run_tests.sh specific tests/test_template_api.py::TestTemplateRenderEndpoint::test_render_success
```

### Direct pytest commands

```bash
# Run all tests with verbose output
pytest -v

# Run specific test class
pytest tests/test_template_api.py::TestTemplateRenderEndpoint -v

# Run specific test method
pytest tests/test_template_api.py::TestTemplateRenderEndpoint::test_render_success -v

# Run with coverage
pytest --cov=app --cov-report=html --cov-report=term

# Run and show print statements
pytest -s

# Run and stop on first failure
pytest -x

# Run only tests matching pattern
pytest -k "credit" -v
```

## Test Structure

### Test Files

- `conftest.py` - Pytest fixtures and configuration
- `test_template_api.py` - Template API endpoint tests

### Test Classes

1. **TestTemplateRenderEndpoint** - Tests for `/api/template/render`
   - Successful rendering
   - Authentication failures
   - Insufficient credits
   - Template ownership validation
   - Template not found errors
   - Input validation

2. **TestTemplateToPDFEndpoint** - Tests for `/api/template/render-to-pdf`
   - PDF generation
   - Authentication
   - Credit checking
   - Response headers and content type

3. **TestTemplateEngine** - Tests for custom template engine
   - Variable substitution
   - Nested objects
   - Data-repeat loops
   - sum() function
   - System variables

4. **TestCreditManagement** - Tests for credit system
   - Checking credits
   - Deducting credits
   - Handling insufficient credits

## Fixtures

Common test fixtures available in `conftest.py`:

- `client` - FastAPI test client
- `mock_user` - Authenticated test user
- `sample_template_data` - Sample order data for testing
- `sample_html_template` - Sample HTML template
- `mock_auth` - Mock authentication
- `mock_credits_available` - Mock user has credits
- `mock_credits_unavailable` - Mock insufficient credits
- `mock_template_ownership_valid` - Mock user owns template
- `mock_fetch_template` - Mock template loading from DB (TemplateService.fetch_template)

## Test Coverage

View coverage report after running:

```bash
./run_tests.sh coverage
# Open htmlcov/index.html in browser
open htmlcov/index.html  # macOS
```

## Writing New Tests

Example test structure:

```python
def test_my_feature(
    client,
    mock_auth,
    mock_credits_available,
    sample_template_data,
):
    """Test description"""
    response = client.post(
        "/api/template/render",
        json={
            "template_id": "HMQywVpZxqAM",
            "version": 1,
            "data": sample_template_data,
        },
    )

    assert response.status_code == 200
    assert "expected content" in response.text
```

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    pip install -e ".[dev]"
    pytest --cov=app --cov-report=xml
```

## Troubleshooting

### Import errors

Make sure you're in the backend directory and have installed the package:

```bash
cd backend
pip install -e ".[dev]"
```

### WeasyPrint errors

WeasyPrint configuration is loaded automatically via `app.weasyprint_config`.

### Async test errors

Make sure `pytest-asyncio` is installed. Tests using async functions should be marked with `@pytest.mark.asyncio`.

## Mocking Strategy

Tests use comprehensive mocking to avoid:
- Real database calls
- Real file system operations
- Real external API calls
- Real credit deductions

This makes tests fast, reliable, and safe to run repeatedly.
