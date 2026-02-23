# CLAUDE.md - Project Context for Claude

## Project Overview

**ParseDocu** - A PDF to Markdown conversion API built from the starterkit template.

### Project Status

- **Phase**: Pre-production (Building Stage 1)
- **Production URL**: https://www.parsedocu.com
- **Repository**: https://github.com/vincentventalon/docuprocess
- **Origin**: Cloned from vincentventalon/starterkit

### Pre-Production Guidelines

Since we are in pre-production:
- **No backward compatibility concerns** - Feel free to make breaking changes to APIs, database schema, or code structure
- **Keep code clean** - Delete unused code, don't add compatibility shims or deprecation warnings
- **Keep database clean** - Modify migrations directly instead of creating new ones for fixes, reset and rebuild as needed

## Tech Stack

| Component | Technology | Hosting |
|-----------|------------|---------|
| Frontend | Next.js 15 (React 19, TypeScript) | Vercel |
| Backend | FastAPI (Python 3.11) | Google Cloud Run |
| Database | PostgreSQL | Supabase |
| Auth | Supabase Auth (JWT + API keys) | Supabase |
| Payments | Stripe | - |
| Storage | Supabase Storage | Supabase |
| Email | Resend | - |

## Project Structure

```
/
├── frontend/               # Next.js frontend
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── content/            # Nextra documentation (MDX)
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── libs/               # Shared libraries
│   ├── public/             # Static assets
│   ├── types/              # TypeScript types
│   ├── config.ts           # App configuration
│   ├── package.json        # Frontend dependencies
│   └── next.config.mjs     # Next.js config
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── routers/        # API endpoints
│   │   │   └── v1/         # Public API v1
│   │   ├── services/       # Business logic
│   │   └── core/           # Config, settings
│   └── deploy.sh           # Cloud Run deploy script
├── integrations/           # Third-party integration templates
│   ├── zapier/             # Zapier CLI integration
│   ├── n8n/                # n8n community node
│   └── make/               # Make.com custom app
├── generated/              # Auto-generated files (do not edit manually)
│   ├── openapi.json        # OpenAPI schema
│   └── postman/            # Postman collection
├── scripts/                # Code generation scripts
│   └── generate.py         # OpenAPI & Postman generator
├── .github/workflows/      # CI/CD pipelines
├── supabase/migrations/    # Database migrations
└── knowledge-center/       # Deep-dive docs (Supabase, etc.)
```

## Common Commands

```bash
# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint

# Backend
cd backend
uv sync              # Install dependencies
uv run pytest        # Run tests
./deploy.sh          # Deploy to Cloud Run

# Regenerate OpenAPI & Postman (run from backend/)
cd backend
uv run python ../scripts/generate.py

# Supabase Database
supabase db reset                     # Reset local DB + apply migrations + seed
supabase migration new <name>         # Create new migration
```

## Teams & Multi-Tenancy

The app uses a team-based multi-tenancy model. All resources belong to teams, not individual users.

### Database Schema

| Table | Purpose |
|-------|---------|
| `teams` | Team entity with name, slug, owner_id, credits |
| `team_api_keys` | API keys table: team_id, api_key, name |
| `team_members` | Junction table: team_id, user_id, role |
| `team_invitations` | Pending invites: team_id, email, token, role |
| `profiles.last_team_id` | User's currently selected team |

### Role Permissions

| Role | Capabilities |
|------|--------------|
| `owner` | Full access, billing, delete team |
| `admin` | Manage members, manage resources |
| `member` | View resources, use API |

## Adding a New API Endpoint

When adding a new V1 API endpoint:

1. Create Pydantic models with examples
2. Document the endpoint with summary/description
3. Regenerate OpenAPI & Postman: `cd backend && uv run python ../scripts/generate.py`

## Known Issues & Gotchas

### Edge Functions & Path Aliases

**Problem**: Next.js middleware (Edge Functions) cannot use `@/` path aliases on Vercel.

**Error**: `The Edge Function "middleware" is referencing unsupported modules: @/libs/...`

**Solution**: Use relative imports in `middleware.ts`:
```typescript
// ❌ Wrong
import { updateSession } from "@/libs/supabase/middleware";

// ✅ Correct
import { updateSession } from "./libs/supabase/middleware";
```

### Supabase Region Convention

Always create Supabase projects in **US regions** (us-east-1 preferred) for consistency with Vercel deployment.

### Vercel Root Directory

For monorepo deployments, ensure Vercel's root directory is set to `frontend/` in project settings.

## Knowledge Center

Deep-dive documentation for specific services lives in `/knowledge-center/`:

- [INIT_PROJECT.md](./knowledge-center/INIT_PROJECT.md) - Project initialization guide and checklist
- [SUPABASE.md](./knowledge-center/SUPABASE.md) - Database, auth, project config, troubleshooting
