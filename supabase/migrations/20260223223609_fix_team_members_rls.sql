-- Fix infinite recursion in team_members RLS policies
-- The issue: policies were querying team_members to check membership,
-- which triggered the same policy, causing infinite recursion.

-- Drop existing policies
DROP POLICY IF EXISTS "Team members can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;

-- New policy: Users can view their own membership rows directly
-- This avoids recursion by checking user_id directly
CREATE POLICY "Users can view own memberships"
    ON public.team_members FOR SELECT
    USING (user_id = auth.uid());

-- Admins and owners can insert/update/delete team members
CREATE POLICY "Admins can manage team members"
    ON public.team_members FOR ALL
    USING (
        user_id = auth.uid()
        AND role IN ('owner', 'admin')
    );
