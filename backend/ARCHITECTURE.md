# Backend Architecture

Clean, organized FastAPI backend with clear separation of concerns.

## Directory Structure

```
app/
├── core/                   # Core utilities and configurations
│   ├── config.py          # Application settings
│   └── template_engine.py # Custom template rendering engine
│
├── dependencies/          # FastAPI dependencies
│   └── auth.py           # Authentication (JWT & API key)
│
├── models/               # Pydantic models
│   └── template.py       # Request/response schemas
│
├── routers/              # API endpoints (thin handlers)
│   ├── pdf.py           # PDF generation endpoints
│   └── template.py      # Template rendering endpoints
│
├── services/             # Business logic layer
│   ├── credit_service.py    # Credit management
│   └── template_service.py  # Template operations
│
├── pdf_generator.py      # PDF generation utilities
├── storage.py            # Supabase storage integration
├── weasyprint_config.py  # WeasyPrint configuration
└── main.py               # FastAPI application

tests/                    # Test suite
├── conftest.py          # Pytest fixtures
└── test_template_api.py # API tests
```

## Architecture Principles

### 1. **Separation of Concerns**

Each layer has a specific responsibility:

- **Routers**: Handle HTTP requests/responses, validation, status codes
- **Services**: Contain business logic, orchestrate operations
- **Models**: Define data structures and validation rules
- **Dependencies**: Provide reusable FastAPI dependencies
- **Core**: Shared utilities and configurations

### 2. **Dependency Flow**

```
Routers → Services → Storage/External APIs
   ↓         ↓
Models    Core Utils
   ↓
Dependencies
```

### 3. **Service Layer Pattern**

Services encapsulate business logic:

```python
# Good: Business logic in service
class TemplateService:
    async def render_template(self, user_id, template_id, data):
        # Fetch template
        # Validate ownership
        # Render with engine
        # Return result

# Router just orchestrates
@router.post("/render")
async def render_template(request, user):
    # 1. Check authorization
    # 2. Check credits
    # 3. Call service
    # 4. Deduct credits
    # 5. Return response
```

## Key Components

### Authentication (`dependencies/auth.py`)

Supports two authentication methods:
- **JWT tokens** - For frontend requests
- **API keys** - For direct API calls

```python
from app.dependencies.auth import get_current_user, AuthenticatedUser

@router.post("/endpoint")
async def endpoint(user: AuthenticatedUser = Depends(get_current_user)):
    # user.user_id, user.email, user.auth_method
    pass
```

### Credit Service (`services/credit_service.py`)

Manages user credits:
- Check credit balance
- Deduct credits
- Get credit count

```python
from app.services.credit_service import credit_service

# Check if user has credits
has_credits = await credit_service.has_enough_credits(user_id, required=1)

# Deduct credits
result = await credit_service.decrement_credits(user_id, amount=1)
```

### Template Service (`services/template_service.py`)

Handles template operations:
- Verify template ownership
- Fetch templates from storage
- Render templates with data
- Generate PDFs

```python
from app.services.template_service import template_service

# Verify ownership
is_owner = await template_service.verify_template_ownership(template_id, user_id)

# Render template
html = await template_service.render_template(user_id, template_id, version, data)

# Generate PDF
pdf_bytes = await template_service.render_template_to_pdf(user_id, template_id, version, data)
```

### Template Engine (`core/template_engine.py`)

Custom templating system supporting:
- Variable substitution: `{{field}}`
- Nested objects: `{{customer.name}}`
- Auto-repeat loops: `<tr>{{items.field}}</tr>` (arrays auto-detected)
- Functions: `{{sum(items.field)}}`
- System variables: `{{page_number}}`, `{{current_date}}`

### Storage (`storage.py`)

Supabase storage integration:
- Generate signed URLs
- Fetch template HTML
- Get template file paths

## API Endpoints

### Template Endpoints

**POST `/api/template/render`**
- Renders template to HTML
- Requires API key
- Costs 1 credit
- Returns HTML with `X-Credits-Remaining` header

**POST `/api/template/render-to-pdf`**
- Renders template to PDF
- Requires API key
- Costs 1 credit
- Returns PDF file

### PDF Endpoints

**POST `/api/pdf/generate`**
- Generate PDF from raw HTML
- Requires API key

**POST `/api/pdf/generate-from-url`**
- Generate PDF from URL
- Requires API key

## Request Flow Example

```
1. Client sends POST /api/template/render with API key
   ↓
2. Router validates request (Pydantic model)
   ↓
3. Dependency validates API key → returns AuthenticatedUser
   ↓
4. Router checks:
   - Template ownership (template_service)
   - Credit balance (credit_service)
   ↓
5. Service layer:
   - Fetches template from storage
   - Renders with template engine
   ↓
6. Router deducts credit (credit_service)
   ↓
7. Router returns HTML + X-Credits-Remaining header
```

## Error Handling

Standard HTTP status codes:
- `200` - Success
- `401` - Unauthorized (invalid API key)
- `402` - Payment Required (insufficient credits)
- `403` - Forbidden (not template owner)
- `404` - Not Found (template doesn't exist)
- `422` - Validation Error (invalid request)
- `500` - Internal Server Error

## Testing

Tests use comprehensive mocking:
- No real database calls
- No real file operations
- No real credit deductions

```bash
# Run tests
pytest

# With coverage
pytest --cov=app --cov-report=html
```

## Adding New Features

### 1. Add a new model

```python
# app/models/new_feature.py
class NewFeatureRequest(BaseModel):
    field: str = Field(..., description="Description")
```

### 2. Add a new service

```python
# app/services/new_service.py
class NewService:
    async def do_something(self, param):
        # Business logic here
        pass

new_service = NewService()
```

### 3. Add a new router

```python
# app/routers/new_router.py
from app.services.new_service import new_service

@router.post("/endpoint")
async def endpoint(request: NewFeatureRequest):
    result = await new_service.do_something(request.field)
    return result
```

### 4. Register router in main.py

```python
from app.routers import new_router

app.include_router(new_router.router, prefix="/api/new", tags=["New"])
```

## Configuration

Environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` - Storage bucket name

## Best Practices

1. **Keep routers thin** - Just handle HTTP concerns
2. **Put logic in services** - Testable, reusable business logic
3. **Use type hints** - Better IDE support and catching bugs
4. **Write tests** - Test services and routers separately
5. **Log important events** - Easier debugging in production
6. **Handle errors gracefully** - Return meaningful error messages
7. **Use dependency injection** - Makes testing easier
8. **Document public APIs** - Clear docstrings for endpoints
