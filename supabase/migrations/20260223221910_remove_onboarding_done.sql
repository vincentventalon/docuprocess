-- Remove onboarding_done column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS onboarding_done;
