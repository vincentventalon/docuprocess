# PDF Template Fast - Backend API

FastAPI backend service for generating PDFs from HTML templates.

## Features

- 🚀 Fast PDF generation using WeasyPrint
- 📝 Jinja2 template variable substitution
- 🔒 API key authentication
- 🌐 CORS support for Next.js frontend
- 📦 Ready for Railway/Render deployment
- 🐳 Docker support

## Tech Stack

- **FastAPI** - Modern Python web framework
- **WeasyPrint** - HTML to PDF conversion
- **Jinja2** - Template rendering engine
- **Uvicorn** - ASGI server

## Local Development

### Prerequisites

- Python 3.11+
- System dependencies for WeasyPrint (see below)

### System Dependencies

**macOS:**
```bash
brew install cairo pango gdk-pixbuf libffi
```

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info
```

**Windows:**
Follow [WeasyPrint Windows installation guide](https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#windows)

### Installation

1. **Install UV (if not already installed):**
   ```bash
   # macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh

   # Or with pip
   pip install uv
   ```

2. **Install dependencies with UV:**
   ```bash
   cd backend

   # UV handles venv creation and dependency installation automatically
   uv sync

   # Or for development with dev dependencies
   uv sync --dev
   ```

   **Alternative (traditional method):**
   ```bash
   # Create venv and install
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   uv pip install -e .
   ```

3. **Set up environment variables:**

   **IMPORTANT:** This backend uses a **shared `.env` file** with the frontend, located in the project root.

   ```bash
   # From the project root (not the backend directory)
   cd ..
   cp .env.example .env
   # Edit .env with your settings
   ```

   The backend will automatically read from `../.env` and ignore frontend-specific variables.

4. **Run the server:**
   ```bash
   # With UV
   uv run uvicorn app.main:app --reload --port 8000

   # Or activate venv first
   source .venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```

The API will be available at `http://localhost:8000`

### API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Health Check

```bash
GET /health
```

### Generate PDF from HTML

```bash
POST /api/pdf/generate
Headers: x-api-key: your-api-key
Content-Type: application/json

{
  "html": "<html><body><h1>Hello {{ name }}!</h1></body></html>",
  "variables": {"name": "World"},
  "custom_css": "@page { size: A4; }",
  "filename": "output.pdf"
}
```

### Generate PDF from URL

```bash
POST /api/pdf/generate-from-url
Headers: x-api-key: your-api-key
Content-Type: application/json

{
  "url": "https://your-supabase.storage.co/templates/abc/v1.json",
  "variables": {"name": "John", "date": "2025-01-16"},
  "filename": "invoice.pdf"
}
```

### Preview HTML

```bash
POST /api/pdf/preview
Headers: x-api-key: your-api-key
Content-Type: application/json

{
  "html": "<html><body>{{ content }}</body></html>",
  "variables": {"content": "Test"}
}
```

## Example Usage from Next.js

```typescript
// app/api/generate-pdf/route.ts
export async function POST(request: Request) {
  const { templateId, variables } = await request.json();

  // Get template URL from Supabase
  const templateUrl = `${supabaseUrl}/storage/v1/object/public/templates/${templateId}/v1.json`;

  // Call Python backend
  const response = await fetch(`${process.env.PYTHON_API_URL}/api/pdf/generate-from-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.PYTHON_API_KEY!,
    },
    body: JSON.stringify({
      url: templateUrl,
      variables,
      filename: 'output.pdf',
    }),
  });

  const pdfBlob = await response.blob();
  return new Response(pdfBlob, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="output.pdf"',
    },
  });
}
```

## Deployment

### Railway

1. Create new project in Railway
2. Connect your GitHub repo
3. Set root directory to `backend`
4. Add environment variables:
   - `API_KEY`
   - `ALLOWED_ORIGINS`
5. Deploy!

### Render

1. Create new Web Service
2. Connect your repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables
5. Deploy!

### Docker

```bash
cd backend
docker build -t pdf-api .
docker run -p 8000:8000 --env-file .env pdf-api
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_KEY` | Secret key for API authentication | `dev-key-change-in-production` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:3000` |
| `PORT` | Server port | `8000` |
| `MAX_PDF_SIZE_MB` | Maximum PDF size in MB | `50` |
| `DEFAULT_PAGE_SIZE` | Default page size | `A4` |

## Development

### Run tests
```bash
uv sync --dev
uv run pytest
```

### Format code
```bash
uv run black .
uv run ruff check .
```

### Type checking
```bash
uv run mypy app/
```

### Add new dependencies
```bash
uv add fastapi httpx
uv add --dev pytest black
```

## Template Format

Templates are stored as JSON with HTML content:

```json
{
  "html": "<!DOCTYPE html><html>...</html>"
}
```

Use Jinja2 syntax for variables:
```html
<h1>Hello {{ name }}!</h1>
<p>Date: {{ date }}</p>
```

## Troubleshooting

### WeasyPrint installation issues
- Make sure system dependencies are installed
- On macOS, use Homebrew to install cairo/pango
- See [WeasyPrint docs](https://doc.courtbouillon.org/weasyprint/stable/first_steps.html)

### CORS errors
- Check `ALLOWED_ORIGINS` includes your frontend URL
- Verify the frontend is sending requests to correct backend URL

### API key errors
- Ensure `x-api-key` header is set in requests
- Check `.env` file has correct `API_KEY`

## License

MIT


curl -X POST http://localhost:8000/api/template/render \
    -H "Content-Type: application/json" \
    -d @test_payload.json \
    -H "x-api-key: sk_a982f0fc0c624472aff9984ce942d24d202d4fd2b3194f4fb85c715882555b47" \
    --output output.html