CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $func$
DECLARE
    v_team_id UUID;
    v_api_key TEXT;
BEGIN
    INSERT INTO public.profiles (id, email, onboarding_done)
    VALUES (NEW.id, NEW.email, false);

    v_team_id := gen_random_uuid();
    INSERT INTO public.teams (id, name, slug, owner_id, credits)
    VALUES (
        v_team_id,
        COALESCE(split_part(NEW.email, '@', 1), 'My Team'),
        v_team_id::TEXT,
        NEW.id,
        1000
    );

    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (v_team_id, NEW.id, 'owner');

    v_api_key := public.generate_api_key();
    INSERT INTO public.team_api_keys (team_id, api_key, name, created_by)
    VALUES (v_team_id, v_api_key, 'Default', NEW.id);

    UPDATE public.profiles SET last_team_id = v_team_id WHERE id = NEW.id;

    RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;
