CREATE OR REPLACE FUNCTION public.refund_credit_team(
    p_team_id UUID,
    p_user_id UUID,
    p_amount INTEGER DEFAULT 1,
    p_resource_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $func$
DECLARE
    v_remaining INTEGER;
BEGIN
    UPDATE public.teams
    SET credits = credits + p_amount,
        updated_at = NOW()
    WHERE id = p_team_id
    RETURNING credits INTO v_remaining;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Team not found'
        );
    END IF;

    INSERT INTO public.transactions (
        team_id, user_id, transaction_type, resource_id, credits
    ) VALUES (
        p_team_id, p_user_id, 'REFUND', p_resource_id, -p_amount
    );

    RETURN jsonb_build_object(
        'success', true,
        'remaining_credits', v_remaining
    );
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;
