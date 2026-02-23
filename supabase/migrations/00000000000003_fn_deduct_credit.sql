CREATE OR REPLACE FUNCTION public.deduct_credit_atomic_team(
    p_team_id UUID,
    p_user_id UUID,
    p_amount INTEGER DEFAULT 1,
    p_resource_id TEXT DEFAULT NULL,
    p_api_key_id UUID DEFAULT NULL
)
RETURNS JSONB AS $func$
DECLARE
    v_remaining INTEGER;
    v_transaction_ref UUID;
BEGIN
    UPDATE public.teams
    SET credits = credits - p_amount,
        updated_at = NOW()
    WHERE id = p_team_id
      AND credits >= p_amount
    RETURNING credits INTO v_remaining;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient credits'
        );
    END IF;

    v_transaction_ref := gen_random_uuid();

    INSERT INTO public.transactions (
        transaction_ref, team_id, user_id, api_key_id,
        transaction_type, resource_id, credits
    ) VALUES (
        v_transaction_ref, p_team_id, p_user_id, p_api_key_id,
        'USAGE', p_resource_id, p_amount
    );

    RETURN jsonb_build_object(
        'success', true,
        'remaining_credits', v_remaining,
        'transaction_ref', v_transaction_ref
    );
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;
