-- Add foreign key from team_members.user_id to profiles.id
-- This allows PostgREST to join team_members with profiles

ALTER TABLE public.team_members
ADD CONSTRAINT team_members_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
