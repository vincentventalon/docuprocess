# Project Initialization Guide

## Overview

This document describes the steps to initialize a new project from the starterkit template.

## What Was Done (docuprocess)

### 1. Clone the Starterkit

```bash
gh repo clone vincentventalon/starterkit
```

### 2. Move Contents to Project Root

```bash
# Move all files including hidden ones
mv starterkit/* starterkit/.[!.]* .

# Merge .claude folders if needed
mv starterkit/.claude/skills .claude/

# Clean up
rm -rf starterkit
```

### 3. Create New GitHub Repository

```bash
# Create new repo and update remote
gh repo create <project-name> --public --source=. --remote=origin --push

# If remote already exists from starterkit:
git remote set-url origin https://github.com/vincentventalon/<project-name>.git
git push -u origin main
```

### 4. Create Supabase Project

> **Convention**: Always create projects in **US regions** (us-east-1 preferred) for consistency.

```bash
# Create organization first (via dashboard or CLI)
supabase orgs list

# Create project in US East
supabase projects create <project-name> \
  --org-id <org-id> \
  --db-password "$(openssl rand -base64 16)" \
  --region us-east-1

# Link project locally
supabase link --project-ref <project-ref>

# Get API keys
supabase projects api-keys --project-ref <project-ref>

# Push migrations to new project
supabase db push
```

### 5. Create Vercel Project

```bash
# Link to Vercel (from frontend directory)
cd frontend && vercel link

# Or create and deploy
vercel --yes
```

## Post-Initialization Checklist

### Immediate Tasks

- [ ] Update `package.json` name and description
- [ ] Update `README.md` with project-specific info
- [ ] Update Supabase project name in `knowledge-center/SUPABASE.md`
- [ ] Create new Supabase project (or link existing)
- [ ] Set up environment variables (`.env.local`, `.env`)
- [ ] Update `claude.md` with project context

### Configuration Updates

- [ ] Update `next.config.js` if needed
- [ ] Configure domain in `config.ts`
- [ ] Set up Stripe products (if using payments)
- [ ] Configure email templates

### GitHub Setup

- [ ] Add repository secrets for CI/CD:
  - `HEALTH_URL` - Supabase health endpoint for keep-alive
  - `SUPABASE_ACCESS_TOKEN` - For migrations
  - `VERCEL_TOKEN` - For deployments (if using)
- [ ] Enable branch protection on `main`
- [ ] Set up GitHub Actions workflows

### Deployment

- [ ] Link to Vercel/deployment platform
- [ ] Configure environment variables in deployment
- [ ] Set up custom domain
- [ ] Configure SSL

## Directory Structure

```
project-root/
├── .claude/
│   ├── settings.local.json    # Claude Code local settings
│   └── skills/                # Custom Claude skills
├── knowledge-center/          # Project documentation
│   ├── INIT_PROJECT.md        # This file
│   └── SUPABASE.md            # Supabase reference
├── frontend/                  # Next.js application
├── backend/                   # Python/FastAPI backend
├── supabase/                  # Supabase config & migrations
├── claude.md                  # Claude Code project context
└── README.md                  # Project readme
```

## Quick Commands Reference

```bash
# Development
npm run dev          # Start frontend
uvicorn main:app     # Start backend

# Database
supabase start       # Local Supabase
supabase db reset    # Reset and apply migrations
supabase gen types   # Generate TypeScript types

# Git
git add -A && git commit -m "message"
git push origin main
```

## Notes

- Always update `claude.md` when project context changes significantly
- Keep `knowledge-center/` updated with learnings and decisions
- Use feature branches for significant changes
