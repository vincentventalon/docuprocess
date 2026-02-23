-- ============================================================================
-- Initial Schema for SaaS Starterkit
-- ============================================================================
-- This migration creates the essential tables for a team-based SaaS application:
-- - profiles: User profiles linked to Supabase Auth
-- - teams: Multi-tenant team/organization support
-- - team_members: Team membership with roles (owner/admin/member)
-- - team_invitations: Pending team invites
-- - team_api_keys: API keys for programmatic access
-- - transactions: Credit usage and purchase history
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- User profiles linked to Supabase auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    is_admin BOOLEAN DEFAULT false,
    customer_id TEXT,  -- Stripe customer ID (legacy, now on teams)
    last_team_id UUID,  -- Current active team
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- TEAMS TABLE
-- ============================================================================
-- Multi-tenant team/organization support

CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits INTEGER DEFAULT 100 NOT NULL,
    customer_id TEXT,  -- Stripe customer ID
    price_id TEXT,  -- Stripe price ID for current plan
    has_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for teams (policies added later after team_members exists)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TEAM MEMBERS TABLE
-- ============================================================================
-- Junction table for team membership with roles

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    invited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- RLS for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Users can view members of their teams
CREATE POLICY "Team members can view team members"
    ON public.team_members FOR SELECT
    USING (
        team_id IN (
            SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

-- Admins and owners can manage team members
CREATE POLICY "Admins can manage team members"
    ON public.team_members FOR ALL
    USING (
        team_id IN (
            SELECT team_id FROM public.team_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- ============================================================================
-- TEAMS POLICIES (now that team_members exists)
-- ============================================================================

-- Team members can view their teams
CREATE POLICY "Team members can view team"
    ON public.teams FOR SELECT
    USING (
        id IN (
            SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

-- Only owners can update their teams (excluding sensitive fields)
CREATE POLICY "Owners can update team"
    ON public.teams FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- ============================================================================
-- TEAM INVITATIONS TABLE
-- ============================================================================
-- Pending team invitations

CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    invited_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Team admins can view and manage invitations
CREATE POLICY "Admins can manage invitations"
    ON public.team_invitations FOR ALL
    USING (
        team_id IN (
            SELECT team_id FROM public.team_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Anyone can view invitation by token (for accepting)
CREATE POLICY "Anyone can view invitation by token"
    ON public.team_invitations FOR SELECT
    USING (true);

-- ============================================================================
-- TEAM API KEYS TABLE
-- ============================================================================
-- API keys for programmatic access

CREATE TABLE IF NOT EXISTS public.team_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    api_key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT 'Default',
    created_by UUID REFERENCES auth.users(id),
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for team_api_keys
ALTER TABLE public.team_api_keys ENABLE ROW LEVEL SECURITY;

-- Team members can view their team's API keys
CREATE POLICY "Team members can view API keys"
    ON public.team_api_keys FOR SELECT
    USING (
        team_id IN (
            SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

-- Admins and owners can manage API keys
CREATE POLICY "Admins can manage API keys"
    ON public.team_api_keys FOR ALL
    USING (
        team_id IN (
            SELECT team_id FROM public.team_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
-- Credit usage and purchase history

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_ref UUID UNIQUE DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    api_key_id UUID REFERENCES public.team_api_keys(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('USAGE', 'PURCHASE', 'REFUND', 'BONUS')),
    resource_id TEXT,  -- Optional reference to resource that consumed credits
    credits INTEGER NOT NULL,
    exec_tm INTEGER,  -- Execution time in ms (for USAGE)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Team members can view their team's transactions
CREATE POLICY "Team members can view transactions"
    ON public.transactions FOR SELECT
    USING (
        team_id IN (
            SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_team_id ON public.transactions(team_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
