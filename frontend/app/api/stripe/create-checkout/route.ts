import { createCheckout } from "@/libs/stripe";
import { createClient } from "@/libs/supabase/server";
import { getCurrentTeamWithBilling } from "@/libs/team";
import { NextRequest, NextResponse } from "next/server";

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
// Billing is now team-based: customer_id comes from the current team
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.priceId) {
    return NextResponse.json(
      { error: "Price ID is required" },
      { status: 400 }
    );
  } else if (!body.successUrl || !body.cancelUrl) {
    return NextResponse.json(
      { error: "Success and cancel URLs are required" },
      { status: 400 }
    );
  } else if (!body.mode) {
    return NextResponse.json(
      {
        error:
          "Mode is required (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
      },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { priceId, mode, successUrl, cancelUrl } = body;

    // Get user profile for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    // Get the current team for billing info
    const teamBilling = await getCurrentTeamWithBilling(supabase, user.id);

    if (!teamBilling) {
      return NextResponse.json(
        { error: "No team found for user" },
        { status: 400 }
      );
    }

    const { teamId, customerId: teamCustomerId } = teamBilling;

    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      // Pass user ID for fallback identification
      clientReferenceId: user.id,
      user: {
        email: profile?.email || user.email,
        // Use team's customer_id to prefill payment method
        customerId: teamCustomerId,
      },
      // Pass team_id in metadata so webhook knows which team to update
      metadata: {
        team_id: teamId,
      },
    });

    return NextResponse.json({ url: stripeSessionURL });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
