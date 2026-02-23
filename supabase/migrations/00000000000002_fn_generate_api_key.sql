CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT AS $func$
BEGIN
    RETURN 'dp_' || encode(extensions.gen_random_bytes(24), 'hex');
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;
