import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
  typescript: true,
});

export async function POST() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to check for Stripe subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("customer_id")
      .eq("id", user.id)
      .single();

    // Cancel Stripe subscription if exists
    if (profile?.customer_id) {
      try {
        // Get all active subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.customer_id,
          status: "active",
        });

        // Cancel all active subscriptions
        for (const subscription of subscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id);
        }
      } catch (stripeError) {
        console.error("Error canceling Stripe subscription:", stripeError);
        // Continue with account deletion even if Stripe cancellation fails
      }
    }

    // Create service role client for admin operations
    const supabaseAdmin = new SupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete user profile (this will cascade delete templates, etc. due to foreign keys)
    await supabaseAdmin.from("profiles").delete().eq("id", user.id);

    // Finally, delete the auth user
    await supabaseAdmin.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
