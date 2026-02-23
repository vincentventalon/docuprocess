# Supabase Knowledge Center

## Project Instance

| Key | Value |
|-----|-------|
| Project URL | https://whcmfrkmvpamvaxugbtz.supabase.co |
| Project Name | starterkit |
| Region | (check dashboard) |
| Plan | Free tier |

## Free Tier Limitations

- **7-day pause**: Database pauses after 7 days of inactivity
- **500MB database**: Storage limit
- **1GB file storage**: Supabase Storage limit
- **2GB bandwidth**: Monthly transfer limit
- **50,000 monthly active users**: Auth limit

### Keeping Free Tier Alive

A GitHub Actions workflow pings the health endpoint daily to prevent auto-pause:

```yaml
# .github/workflows/keep-alive.yml
name: Keep Supabase alive
on:
  schedule:
    - cron: '0 0 * * *'
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl ${{ secrets.HEALTH_URL }}
```

Note: This is a gray area ethically. Consider upgrading to Pro ($25/mo) if the project generates revenue.

## Services Used

| Service | Usage in Project |
|---------|------------------|
| PostgreSQL | Main database (teams, profiles, API keys) |
| Auth (GoTrue) | User authentication, JWT tokens |
| Storage | (if used) File uploads |
| Realtime | (if used) Live subscriptions |

## Local Development

```bash
# Start local Supabase stack
supabase start

# Stop local stack
supabase stop

# Reset DB and apply migrations
supabase db reset

# Create new migration
supabase migration new <name>

# Push migrations to remote
supabase db push

# Pull remote schema changes
supabase db pull

# Generate TypeScript types
supabase gen types typescript --local > frontend/types/supabase.ts
```

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://whcmfrkmvpamvaxugbtz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### Backend (.env)

```env
SUPABASE_URL=https://whcmfrkmvpamvaxugbtz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Find keys at: https://supabase.com/dashboard/project/whcmfrkmvpamvaxugbtz/settings/api

## Database Schema

See migrations in `supabase/migrations/` for full schema.

### Core Tables

```sql
-- Teams (multi-tenancy root)
teams (id, name, slug, owner_id, credits, created_at)

-- Team membership
team_members (team_id, user_id, role)  -- role: owner|admin|member

-- API keys for programmatic access
team_api_keys (id, team_id, api_key, name, created_at)

-- Pending invitations
team_invitations (id, team_id, email, token, role, expires_at)

-- User profiles (extends auth.users)
profiles (id, email, full_name, avatar_url, last_team_id)
```

### Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only access teams they're members of
- Team owners have full control
- API keys are scoped to their team

## Common Patterns

### Server-side Supabase Client (Next.js)

```typescript
import { createClient } from '@/libs/supabase/server'

export async function getTeam(teamId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()
  return data
}
```

### Client-side Supabase Client

```typescript
import { createClient } from '@/libs/supabase/client'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Service Role Client (Backend/Admin)

```python
from supabase import create_client

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)
# Bypasses RLS - use carefully
```

## Troubleshooting

### "Database is paused"
1. Go to Supabase dashboard
2. Click "Restore project"
3. Set up keep-alive workflow to prevent future pauses

### "JWT expired"
- Supabase Auth tokens expire after 1 hour by default
- Client SDK handles refresh automatically
- For backend, verify tokens haven't expired before processing

### "RLS policy violation"
- Check that user is authenticated
- Verify user has team membership
- Check policy conditions in `supabase/migrations/`

### Migration conflicts
```bash
# Reset local to match remote
supabase db reset

# If remote is ahead, pull changes
supabase db pull
```

## Alternatives (If Moving Away)

| Need | Alternative | Notes |
|------|-------------|-------|
| Database | Neon (free, no pause) | Direct Postgres, need connection pooling |
| Auth | NextAuth.js / Auth.js | Self-hosted, more control |
| Storage | Cloudflare R2 | Free egress |
| Realtime | Pusher / Ably | Or skip if not needed |
